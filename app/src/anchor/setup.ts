import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, Solarchive } from "./idl";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const programId = new PublicKey(
  "5YNGLpTaGqUiamL1pW59dPCBZFMfc65oiwZ4X5JJ7EDM"
);
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
export const connection = new Connection("http://127.0.0.1:8899");

export const program = new Program<Solarchive>(IDL, programId, {
  connection,
});

// AnchorWallet 인터페이스 추가
export interface AnchorWallet {
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
  publicKey: PublicKey;
}

// wallet을 포함한 프로그램 설정
export const getProgram = (wallet: AnchorWallet) => {
  return new Program<Solarchive>(IDL, programId, {
    connection,
    wallet,
  });
};

// state
export const getAllSharedDatabases = async () => {
  const accounts = await program.account.sharedDatabase.all([]);
  console.log("sharedDatabase", accounts);
  return accounts;
};
export const getOwnerSplitData = async () => {
  const accounts = await program.account.splitData.all([]);
  console.log("spliData", accounts);
  return accounts;
};

// instructions
export const initializeData = async (
  splitDataKeypair: Keypair,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
  console.log(splitDataKeypair);
  const program = getProgram(wallet);
  const tx = await program.methods
    .initializeData()
    .accounts({
      split_data: splitDataKeypair.publicKey,
      owner: publicKey,
      system_program: SystemProgram.programId,
    })
    // .signers([splitDataKeypair])
    // .rpc();
    .instruction();
  return tx;
};
export const appendSplitData = async (
  splitDataKeypair: Keypair,
  content: string,
  prevTransactionId: string | null,
  prevData: PublicKey | undefined,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
  const program = getProgram(wallet);
  const tx = await program.methods
    .appendData(content, prevTransactionId || "")
    .accounts({
      split_data: splitDataKeypair.publicKey,
      prev_data: prevData,
      owner: publicKey,
      system_program: SystemProgram.programId,
    })
    .instruction();
  // .rpc();
  return tx;
};
export const createSharedDatabase = async (
  databaseKeypair: Keypair,
  name: string,
  dataType: string,
  lastSplitData: PublicKey,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
  const program = getProgram(wallet);
  const tx = await program.methods
    .createDatabase(name, dataType, lastSplitData)
    .accounts({
      database: databaseKeypair.publicKey,
      last_split_data: lastSplitData,
      owner: publicKey,
      system_program: SystemProgram.programId,
    })
    .instruction();
  // .signers([databaseKeypair])
  // .rpc();
  return tx;
};

export type CounterData = IdlAccounts<Solarchive>["solarchive"];
