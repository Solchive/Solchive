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
      // console.log(nextRecord);
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
