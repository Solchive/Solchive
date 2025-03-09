import { Keypair, PublicKey } from "@solana/web3.js";
import {
  initializeData,
  createSharedDatabase,
  appendSplitData,
  getAllSharedDatabases,
  getOwnerSplitData,
  connection,
} from "../anchor/setup";
import * as pako from "pako";
import testData from "./test.json";
import { AnchorProvider, getProvider } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";

const MAX_CHUNK_SIZE = 10485000; // 약 10MB, 여유 공간 고려

export function chunkData(data: any[]): string[] {
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

export const createNewDatabase = async (name: string, data_type: string) => {
  try {
    const splitDataKeypair = Keypair.generate();
    const databaseKeypair = Keypair.generate();

    // const provider = new AnchorProvider(connection, walletContextState, {
    //   commitment: "confirmed",
    //   skipPreflight: true,
    //   preflightCommitment: "confirmed",
    // });
    // if (!provider) {
    //   throw new Error("Provider가 설정되지 않았습니다.");
    // }

    let prevDataAccount = null;
    let lastTransactionId = null;

    const chunks = chunkData(testData.records);

    // 1. 초기화
    const initTx = await initializeData(
      splitDataKeypair,
      splitDataKeypair.publicKey
    );
    console.log("초기화 완료:", initTx);

    // 2. SharedDatabase 생성
    console.log("\n첫 번째 청크 저장 중...");
    const firstTx = await appendSplitData(
      splitDataKeypair,
      chunks[0],
      null,
      undefined
    );
    prevDataAccount = splitDataKeypair.publicKey;
    lastTransactionId = firstTx;
    console.log("첫 번째 청크 저장 완료:", firstTx);

    // 3. 나머지 청크 저장
    console.log("\n나머지 청크 저장 중...");
    for (let i = 1; i < chunks.length; i++) {
      const tx = await appendSplitData(
        splitDataKeypair,
        chunks[i],
        lastTransactionId,
        prevDataAccount
      );
      prevDataAccount = splitDataKeypair.publicKey;
      lastTransactionId = tx;
      console.log(`청크 ${i + 1} 저장 완료:`, tx);

      // 트랜잭션 간 딜레이
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 4. 데이터베이스 생성
    console.log("\n데이터베이스 생성 중...");
    const dbTx = await createSharedDatabase(
      databaseKeypair,
      name,
      data_type,
      splitDataKeypair.publicKey
    );
    console.log("데이터베이스 생성 완료:", dbTx);
  } catch (error) {
    console.error("에러 발생:", error);
  }
};
