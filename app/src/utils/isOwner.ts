import { PublicKey } from "@solana/web3.js";

// 1. 단순히 PublicKey 비교
export const isOwner = (
  userPublicKey: PublicKey,
  ownerPublicKey: PublicKey
) => {
  return userPublicKey.equals(ownerPublicKey);
};

// 2. SharedDatabase의 소유자 확인
export const isSharedDatabaseOwner = async (
  userPublicKey: PublicKey,
  databasePublicKey: PublicKey
) => {
  const database = await getSharedDatabase(databasePublicKey);
  return database.owner.equals(userPublicKey);
};

// 3. SplitData의 소유자 확인
export const isSplitDataOwner = async (
  userPublicKey: PublicKey,
  splitDataPublicKey: PublicKey
) => {
  const splitData = await getSplitData(splitDataPublicKey);
  return splitData.owner.equals(userPublicKey);
};

// 사용 예시
async function verifyOwnership() {
  try {
    const userWallet = Keypair.generate(); // 실제로는 사용자의 연결된 지갑

    // SharedDatabase 생성
    const dbTx = await createSharedDatabase(
      userWallet.publicKey,
      "테스트 DB",
      "설명"
    );

    // 데이터베이스 목록 가져오기
    const databases = await getAllSharedDatabases();
    const lastDatabase = databases[databases.length - 1];

    // 소유권 확인
    const isOwnerOfDB = await isSharedDatabaseOwner(
      userWallet.publicKey,
      lastDatabase.publicKey
    );

    console.log("데이터베이스 소유자 맞음?:", isOwnerOfDB);

    // 다른 지갑으로 확인
    const otherWallet = Keypair.generate();
    const isOtherWalletOwner = await isSharedDatabaseOwner(
      otherWallet.publicKey,
      lastDatabase.publicKey
    );

    console.log("다른 지갑이 소유자?:", isOtherWalletOwner); // false
  } catch (error) {
    console.error("확인 중 에러 발생:", error);
  }
}
