import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, Solarchive } from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const programId = new PublicKey("5YNGLpTaGqUiamL1pW59dPCBZFMfc65oiwZ4X5JJ7EDM");
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const connection = new Connection("http://127.0.0.1:8899");

export const program = new Program<Solarchive>(IDL, programId, {
  connection,
});

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

export type CounterData = IdlAccounts<Solarchive>["solarchive"];
