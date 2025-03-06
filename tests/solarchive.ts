import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solarchive } from "../target/types/solarchive";
import * as pako from "pako";
import { BorshCoder } from "@coral-xyz/anchor";
import * as bs58 from "bs58";
import testData from "./test.json";
import { Keypair } from "@solana/web3.js";
import * as fs from "fs";

describe("solarchive", () => {
  // local 용
  // const provider = anchor.AnchorProvider.env();
  // devnet 용
  const provider = new anchor.AnchorProvider(
    anchor.getProvider().connection,
    new anchor.Wallet(
      Keypair.fromSecretKey(
        new Uint8Array(
          JSON.parse(fs.readFileSync("phantom-wallet.json", "utf-8"))
        )
      )
    ),
    anchor.AnchorProvider.defaultOptions()
  );

  anchor.setProvider(provider);

  const program = anchor.workspace.Solarchive as Program<Solarchive>;
  const IDL = program.idl;

  const MAX_CHUNK_SIZE = 10485000; // 약 10MB, 여유 공간 고려

  // 1) json 한 개씩 잘라서 배열로 만드는 방법
  // function chunkData(data: any[]): string[] {
  //   const chunks: string[] = [];
  //   let currentChunk: any[] = [];
  //   let currentSize = 0;

  //   for (const record of data) {
  //     const recordString = JSON.stringify(record);
  //     if (
  //       currentSize + recordString.length > MAX_CHUNK_SIZE &&
  //       currentChunk.length > 0
  //     ) {
  //       chunks.push(JSON.stringify(currentChunk));
  //       currentChunk = [];
  //       currentSize = 0;
  //     }
  //     currentChunk.push(record);
  //     currentSize += recordString.length;
  //   }

  //   if (currentChunk.length > 0) {
  //     chunks.push(JSON.stringify(currentChunk));
  //   }

  //   return chunks;
  // }

  // 2) 꽉 채워서 담는 방법
  // function chunkData(data: any[]): string[] {
  //   const chunks: string[] = [];
  //   let startIdx = 0;

  //   while (startIdx < data.length) {
  //     let endIdx = startIdx;
  //     let chunkSize = 2; // [] 괄호 고려

  //     // 가능한 많은 레코드를 하나의 청크에 담기
  //     while (endIdx < data.length) {
  //       const nextRecord = data[endIdx];
  //       const recordSize =
  //         JSON.stringify(nextRecord).length + (endIdx > startIdx ? 1 : 0); // 쉼표 고려

  //       if (chunkSize + recordSize <= MAX_CHUNK_SIZE) {
  //         chunkSize += recordSize;
  //         endIdx++;
  //       } else {
  //         break;
  //       }
  //     }

  //     chunks.push(JSON.stringify(data.slice(startIdx, endIdx)));
  //     startIdx = endIdx;
  //   }

  //   return chunks;
  // }

  // 압축
  // function chunkData(data: any[]): string[] {
  //   const chunks: string[] = [];
  //   let startIdx = 0;

  //   while (startIdx < data.length) {
  //     let endIdx = startIdx;
  //     let chunkSize = 2; // [] 괄호 고려

  //     while (endIdx < data.length) {
  //       const nextRecord = data[endIdx];
  //       const compressedData = pako.deflate(JSON.stringify(nextRecord));
  //       const recordSize = compressedData.length + (endIdx > startIdx ? 1 : 0); // 쉼표 고려

  //       console.log(`레코드 ${endIdx}의 압축 크기:`, compressedData.length);
  //       console.log(`현재 청크 크기:`, chunkSize);

  //       if (chunkSize + recordSize <= MAX_CHUNK_SIZE) {
  //         chunkSize += recordSize;
  //         endIdx++;
  //       } else {
  //         break;
  //       }
  //     }

  //     // 최종 청크 압축
  //     const chunk = data.slice(startIdx, endIdx);
  //     const compressedChunk = pako.deflate(JSON.stringify(chunk));
  //     chunks.push(Buffer.from(compressedChunk).toString("base64"));

  //     startIdx = endIdx;
  //   }
  //   return chunks;
  // }

  // 압축 2
  function chunkData(data: any[]): string[] {
    const chunks: string[] = [];
    let startIdx = 0;

    while (startIdx < data.length) {
      let endIdx = startIdx;
      let chunk: any[] = [];
      let compressedSize = 2; // [] 괄호 고려

      while (endIdx < data.length) {
        const nextRecord = data[endIdx];
        chunk.push(nextRecord);

        // 전체 청크를 압축해서 크기 확인
        const testChunk = pako.deflate(JSON.stringify(chunk));
        const encodedSize = Buffer.from(testChunk).toString("base64").length;

        if (encodedSize <= MAX_CHUNK_SIZE) {
          endIdx++;
        } else {
          // 마지막 추가한 항목 제거
          chunk.pop();
          break;
        }
      }

      // 최종 청크 압축 및 저장
      const compressedChunk = pako.deflate(JSON.stringify(chunk));
      chunks.push(Buffer.from(compressedChunk).toString("base64"));

      startIdx = endIdx;
      console.log(`청크 크기: ${chunks[chunks.length - 1].length} 바이트`);
    }
    return chunks;
  }

  it("append data", async () => {
    // 초기 account 생성
    const splitDataKeypair = anchor.web3.Keypair.generate();
    console.log("Split Data Account:", splitDataKeypair.publicKey.toString());

    let prevDataAccount: anchor.web3.PublicKey | null = null;
    let lastTransactionId: string | null = null;

    const chunks = chunkData(testData.records);

    // 계정 생성을 위한 초기화 트랜잭션
    await program.methods
      .initializeData()
      .accounts({
        splitData: splitDataKeypair.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([splitDataKeypair])
      .rpc();

    // 첫 번째 저장 (initialize)
    const firstTx = await program.methods
      .appendData(chunks[0], "")
      .accounts({
        splitData: splitDataKeypair.publicKey,
        prevData: null,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    prevDataAccount = splitDataKeypair.publicKey;
    lastTransactionId = firstTx;
    console.log("첫 번째 저장 : ", lastTransactionId);

    // 나머지 저장 (account update)
    for (let i = 1; i < chunks.length; i++) {
      const txs = await program.methods
        .appendData(chunks[i], lastTransactionId)
        .accounts({
          splitData: splitDataKeypair.publicKey,
          prevData: prevDataAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      prevDataAccount = splitDataKeypair.publicKey;
      lastTransactionId = txs;
      console.log("나머지 저장 : ", lastTransactionId);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 데이터베이스 생성
    const databaseKeypair = anchor.web3.Keypair.generate();
    console.log("Database Account:", databaseKeypair.publicKey.toString());

    await program.methods
      .createDatabase("테스트 DB", "tasks", splitDataKeypair.publicKey)
      .accounts({
        database: databaseKeypair.publicKey,
        lastSplitData: splitDataKeypair.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([databaseKeypair])
      .rpc();
  });

  it("get data", async () => {
    // console.log("원본 데이터:", JSON.stringify(testData.records, null, 2));

    const databaseAccounts = await program.account.sharedDatabase.all();
    if (databaseAccounts.length === 0) {
      throw new Error("데이터베이스를 찾을 수 없습니다");
    }
    const database = databaseAccounts[0].account;

    let allData: any[] = [];

    let curSplitDataPubkey = database.lastId; // split data id

    const splitDataAccount = await program.account.splitData.fetch(
      curSplitDataPubkey
    );

    // 1/2 일반 ver
    // const chunkData = JSON.parse(splitDataAccount.data);
    // 3 압축 ver
    const chunkData = JSON.parse(
      pako.inflate(Buffer.from(splitDataAccount.data, "base64"), {
        to: "string",
      })
    );
    console.log("마지막 청크 데이터:", chunkData, null, 2);
    allData = [...chunkData, ...allData]; // 역순 추가

    let prevSplitDataId = splitDataAccount.prevId; // split data transaction id
    const coder = new BorshCoder(IDL);

    while (prevSplitDataId) {
      const transaction = await provider.connection.getTransaction(
        prevSplitDataId,
        {
          maxSupportedTransactionVersion: 0,
          commitment: "confirmed",
        }
      );

      if (!transaction) {
        throw new Error(`트랜잭션을 찾을 수 없습니다: ${prevSplitDataId}`);
      }

      // const instructionData =
      //   transaction.transaction.message.instructions[0].data;
      // const buffer = Buffer.from(instructionData, "base64");

      // const dataWithoutDiscriminator = buffer.subarray(8);
      // const jsonDataLength = dataWithoutDiscriminator.readUInt32LE(0);
      // const jsonData = dataWithoutDiscriminator
      //   .subarray(4, 4 + jsonDataLength)
      //   .toString("utf8");

      try {
        // Borsh를 사용하여 instruction 데이터 디코딩
        const ix = coder.instruction.decode(
          transaction.transaction.message.instructions[0].data,
          "base58"
        );

        if (!ix) {
          throw new Error("instruction 데이터를 파싱할 수 없습니다");
        }

        // account metadata 가져오기
        const accountMetas =
          transaction.transaction.message.instructions[0].accounts.map(
            (idx) => ({
              pubkey: transaction.transaction.message.accountKeys[idx],
              isSigner: transaction.transaction.message.isAccountSigner(idx),
              isWritable:
                transaction.transaction.message.isAccountWritable(idx),
            })
          );

        // instruction 데이터 포맷팅
        const formatted = coder.instruction.format(ix, accountMetas);
        // console.log("디코딩된 데이터:", ix);
        // console.log("포맷된 데이터:", formatted);

        // json_data 필드에서 실제 데이터 추출
        const chunkData = JSON.parse(
          pako.inflate(Buffer.from(ix.data.jsonData, "base64"), {
            to: "string",
          })
        );
        allData = [...chunkData, ...allData];

        // 다음 트랜잭션의 ID 가져오기
        // const accountData = await program.account.splitData.fetch(currentPubkey);
        prevSplitDataId = ix.data.prevId;
      } catch (error) {
        console.error("데이터 처리 중 오류:", error);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("복원 데이터:", allData);

    // 원본 데이터와 비교
    // console.log("온체인 길이:", allData.length);
    // console.log("원본 길이:", testData.records.length);
    // assert.equal(
    //   allData.length,
    //   testData.records.length,
    //   "Data length should match"
    // );

    // 데이터 내용 비교
    // for (let i = 0; i < allData.length; i++) {
    //   assert.deepEqual(
    //     allData[i],
    //     testData.records[i],
    //     `Data at index ${i} should match`
    //   );
    // }
  });
});
