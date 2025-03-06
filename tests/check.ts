// tests/check.ts
import { Connection, clusterApiUrl, PublicKey, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solarchive } from "../target/types/solarchive";
import * as fs from "fs";

async function main() {
  // devnet 연결
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // 프로그램 ID
  const programId = new PublicKey(
    "5YNGLpTaGqUiamL1pW59dPCBZFMfc65oiwZ4X5JJ7EDM"
  );

  // 먼저 프로그램 자체의 정보 확인
  console.log("\n=== 프로그램 정보 ===");
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo) {
    console.log("프로그램 크기:", programInfo.data.length, "bytes");
    console.log("프로그램 Rent Fee:", programInfo.lamports / 1000000000, "SOL");
  } else {
    console.log("프로그램을 찾을 수 없습니다!");
    return;
  }

  // 프로그램 계정 조회
  const accounts = await connection.getProgramAccounts(programId);
  console.log(`\n=== 프로그램 계정 목록 ===`);
  console.log(`총 ${accounts.length}개의 계정 발견\n`);

  if (accounts.length === 0) {
    console.log("아직 저장된 데이터가 없습니다.");
    console.log("테스트 데이터를 저장해보시겠습니까?");
    // 여기에 데이터 저장 로직 추가 가능
  } else {
    for (const { pubkey, account } of accounts) {
      console.log("계정 주소:", pubkey.toBase58());
      console.log("Rent Fee:", account.lamports / 1000000000, "SOL");
      console.log("데이터 크기:", account.data.length, "bytes");
      console.log("------------------------");
    }
  }
}

main().catch(console.error);
