// tests/store-test-data.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as pako from "pako";
import testData from "./test.json";
import { Solarchive } from "../target/types/solarchive";

const MAX_CHUNK_SIZE = 10485000;

async function main() {
  // devnet 연결
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  // 지갑 설정
  const wallet = new anchor.Wallet(
    Keypair.fromSecretKey(
      Uint8Array.from(
        JSON.parse(fs.readFileSync("phantom-wallet.json", "utf-8"))
      )
    )
  );

  // provider 설정
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // 프로그램 설정
  const program = new Program<Solarchive>(
    require("../target/idl/solarchive.json"),
    new PublicKey("5YNGLpTaGqUiamL1pW59dPCBZFMfc65oiwZ4X5JJ7EDM"),
    provider
  );

  function chunkData(data: any[]): string[] {
    const chunks: string[] = [];
    let startIdx = 0;

    while (startIdx < data.length) {
      let endIdx = startIdx;
      let chunk: any[] = [];

      while (endIdx < data.length) {
        const nextRecord = data[endIdx];
        chunk.push(nextRecord);

        const testChunk = pako.deflate(JSON.stringify(chunk));
        const encodedSize = Buffer.from(testChunk).toString("base64").length;

        if (encodedSize <= MAX_CHUNK_SIZE) {
          endIdx++;
        } else {
          chunk.pop();
          break;
        }
      }

      const compressedChunk = pako.deflate(JSON.stringify(chunk));
      chunks.push(Buffer.from(compressedChunk).toString("base64"));

      startIdx = endIdx;
      console.log(`청크 크기: ${chunks[chunks.length - 1].length} 바이트`);
    }
    return chunks;
  }

  try {
    const splitDataKeypair = Keypair.generate();
    console.log("\n=== 데이터 저장 시작 ===");
    console.log("Split Data Account:", splitDataKeypair.publicKey.toString());

    const chunks = chunkData(testData.records);

    // 계정 초기화
    console.log("\n계정 초기화 중...");
    const initTx = await program.methods
      .initializeData()
      .accounts({
        splitData: splitDataKeypair.publicKey,
        owner: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([splitDataKeypair])
      .rpc();

    console.log("초기화 트랜잭션:", initTx);

    // 첫 번째 데이터 저장
    console.log("\n첫 번째 데이터 저장 중...");
    const firstTx = await program.methods
      .appendData(chunks[0], "")
      .accounts({
        splitData: splitDataKeypair.publicKey,
        prevData: null,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    let lastTransactionId = firstTx;
    console.log("첫 번째 트랜잭션:", lastTransactionId);

    // 나머지 데이터 저장
    for (let i = 1; i < chunks.length; i++) {
      console.log(`\n${i + 1}번째 데이터 저장 중...`);
      const tx = await program.methods
        .appendData(chunks[i], lastTransactionId)
        .accounts({
          splitData: splitDataKeypair.publicKey,
          prevData: splitDataKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      lastTransactionId = tx;
      console.log(`트랜잭션: ${tx}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 데이터베이스 생성
    const databaseKeypair = Keypair.generate();
    console.log("\n=== 데이터베이스 생성 ===");
    console.log("Database Account:", databaseKeypair.publicKey.toString());

    const dbTx = await program.methods
      .createDatabase("테스트 DB", "tasks", splitDataKeypair.publicKey)
      .accounts({
        database: databaseKeypair.publicKey,
        lastSplitData: splitDataKeypair.publicKey,
        owner: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([databaseKeypair])
      .rpc();

    console.log("데이터베이스 트랜잭션:", dbTx);
    console.log("\n데이터 저장 완료!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);
