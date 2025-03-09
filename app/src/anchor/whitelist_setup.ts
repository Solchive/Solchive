import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, Solchive } from "./whitelist_idl";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const programId = new PublicKey(
  "D3FVceibAfCXFfk2q94MVseCCJVsXsXtJM7B7ykgYSi6"
);
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
export const connection = new Connection("http://127.0.0.1:8899");

console.log("IDL:", IDL);
console.log("Program ID:", programId.toString());

export const whitelist_program = new Program<Solchive>(
  IDL as any,
  programId.toString(),
  {
    connection,
  }
);

// AnchorWallet 인터페이스 추가
export interface AnchorWallet {
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
  publicKey: PublicKey;
}

// wallet을 포함한 프로그램 설정
export const getProgram = (wallet: AnchorWallet) => {
  return new Program<Solchive>(IDL, programId, {
    connection,
    wallet,
  });
};

// state
export const getAllWhitelist = async () => {
  const accounts = await whitelist_program.account.whitelist.all([]);
  console.log("whitelist : ", accounts);
  return accounts;
};

// instructions
export const createWhitelist = async (
  whitelistKeypair: Keypair,
  name: string,
  user: PublicKey,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
  const program = getProgram(wallet);

  // Create the PDA for whitelist account
  const [whitelistPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("whitelist_seed"), publicKey.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .createWhitelist(name, user)
    .accounts({
      whitelistAccount: whitelistPDA,
      owner: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  return tx;
};

export const renameWhitelist = async (
  whitelistAccount: PublicKey,
  name: string,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
  const program = getProgram(wallet);

  const tx = await program.methods
    .renameWhitelist(name)
    .accounts({
      whitelistAccount: whitelistAccount,
      signer: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  return tx;
};

export const addWhitelist = async (
  whitelistAccount: PublicKey,
  user: PublicKey,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
  const program = getProgram(wallet);

  const tx = await program.methods
    .addWhitelist(user)
    .accounts({
      whitelistAccount: whitelistAccount,
      signer: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  return tx;
};

export const deleteWhitelist = async (
  whitelistAccount: PublicKey,
  user: PublicKey,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
  const program = getProgram(wallet);

  const tx = await program.methods
    .deleteWhitelist(user)
    .accounts({
      whitelistAccount: whitelistAccount,
      signer: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  return tx;
};

export type CounterData = IdlAccounts<Solchive>["whitelist"];
