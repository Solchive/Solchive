import { AnchorProvider, IdlAccounts, Program } from "@coral-xyz/anchor";
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
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program<Solarchive>(IDL, programId, provider);
};

// state
export const getAllSharedDatabases = async () => {
  const accounts = await program.account.sharedDatabase.all([]);
  console.log("sharedDatabase:", accounts);

  const programAccounts = await connection.getProgramAccounts(programId);
  console.log("All program accounts:", programAccounts);

  return accounts;
};
export const getAllSplitData = async () => {
  const accounts = await program.account.splitData.all([]);
  console.log("splitData:", accounts);
  return accounts;
};
export const getOwnerSplitData = async (splitDataKeypair: Keypair) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const account = await program.account.splitData.fetch(
      splitDataKeypair.publicKey
    );
    console.log("splitData", account);
    return account;
  } catch (error) {
    console.error("계정 데이터 조회 중 오류 발생:", error);
    throw error;
  }
};

// instructions
export const initializeData = async (
  splitDataKeypair: Keypair,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
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
  prevData: PublicKey | null,
  publicKey: PublicKey,
  wallet: AnchorWallet
) => {
  const program = getProgram(wallet);
  const accounts = {
    split_data: splitDataKeypair.publicKey,
    owner: publicKey,
    prev_data: prevData || null,
  };
  console.log(accounts);
  const tx = await program.methods
    .appendData(content, prevTransactionId || "")
    .accounts(accounts)
    .signers([splitDataKeypair])
    .instruction();
  return tx;
};
// export const createSharedDatabase = async (
//   name: string,
//   data_type: string,
//   last_id: PublicKey,
//   wallet: AnchorWallet
// ) => {
//   const program = getProgram(wallet);
//   const databaseKeypair = Keypair.generate();

//   console.log("Input values:", {
//     name,
//     data_type,
//     last_id: last_id.toBase58(),
//     programId: program.programId.toBase58(),
//     databaseKey: databaseKeypair.publicKey.toBase58(),
//     walletKey: wallet.publicKey.toBase58(),
//   });

//   try {
//     const tx = await program.methods
//       .createDatabase(
//         name,
//         data_type,
//         new PublicKey("3oKmkS7uMTSBrwT8h2MWELQ8svqSysAivLnFB3GvtLvz")
//       )
//       .accounts({
//         database: databaseKeypair.publicKey,
//         owner: wallet.publicKey,
//         system_program: SystemProgram.programId,
//       })
//       .signers([databaseKeypair])
//       .rpc();

//     console.log("트랜잭션 서명:", tx);
//     console.log(
//       "생성된 데이터베이스 주소:",
//       databaseKeypair.publicKey.toString()
//     );

//     return {
//       signature: tx,
//       databasePublicKey: databaseKeypair.publicKey,
//     };
//   } catch (error) {
//     console.error("Transaction error:", {
//       error,
//       program: program.programId.toBase58(),
//       instruction: "createDatabase",
//       args: { name, data_type, last_id: last_id.toBase58() },
//       accounts: {
//         database: databaseKeypair.publicKey.toBase58(),
//         owner: wallet.publicKey.toBase58(),
//         systemProgram: SystemProgram.programId.toBase58(),
//       },
//     });
//     throw error;
//   }
// };

export const createSharedDatabase = async (
  databaseKeypair: Keypair,
  name: string,
  dataType: string,
  splitDataPublicKey: PublicKey,
  wallet: AnchorWallet
) => {
  const program = getProgram(wallet);

  const tx = await program.methods
    .createDatabase(name, dataType, splitDataPublicKey)
    .accounts({
      database: databaseKeypair.publicKey,
      owner: wallet.publicKey,
      system_program: SystemProgram.programId,
    })
    // .signers([databaseKeypair])
    // .remainingAccounts([])
    // .rpc();
    .instruction();

  //   tx.feePayer = wallet.publicKey;
  //   tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  //   // 서명
  //   tx.partialSign(databaseKeypair);
  //   const signedTx = await wallet.signTransaction(tx);

  //   // 트랜잭션 전송
  //   const rawTx = signedTx.serialize();
  //   const signature = await connection.sendRawTransaction(rawTx, {
  //     skipPreflight: true,
  //     preflightCommitment: "confirmed",
  //   });

  //   // 트랜잭션 확인
  //   await connection.confirmTransaction(signature);

  return tx;
};

export type CounterData = IdlAccounts<Solarchive>["solarchive"];
