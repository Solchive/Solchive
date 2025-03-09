import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const secretKey = new Uint8Array([
  239, 0, 157, 34, 186, 22, 199, 215, 169, 27, 81, 77, 186, 219, 189, 69, 149,
  85, 63, 106, 100, 103, 96, 24, 33, 141, 52, 236, 252, 185, 13, 154, 47, 173,
  213, 205, 48, 218, 253, 90, 125, 139, 114, 157, 192, 114, 57, 5, 155, 210,
  144, 223, 44, 155, 175, 49, 102, 255, 148, 134, 30, 108, 32, 221,
]);
const keypair = Keypair.fromSecretKey(secretKey);
const base58SecretKey = bs58.encode(secretKey);
console.log("Base58 비밀키:", base58SecretKey);
