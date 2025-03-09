import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solarchive } from "../target/types/solarchive";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";

describe("solchive", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solchive as Program<Solarchive>;

  // Get the wallet (owner account)
  const owner = provider.wallet.publicKey;

  // Create wallet for testing whitelist functionality
  const testUser1 = anchor.web3.Keypair.generate();
  const testUser2 = anchor.web3.Keypair.generate();
  const testUser3 = anchor.web3.Keypair.generate();
  const testUser4 = anchor.web3.Keypair.generate();
  const testUser5 = anchor.web3.Keypair.generate();
  const testUser6 = anchor.web3.Keypair.generate();

  // Define the PDA for the whitelist account
  let whitelistAccount: PublicKey;
  let whitelistBump: number;

  before(async () => {
    // Airdrop SOL to test accounts
    const airdropSignature = await provider.connection.requestAirdrop(
      testUser1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    const airdropSignature2 = await provider.connection.requestAirdrop(
      testUser2.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature2);

    const airdropSignature3 = await provider.connection.requestAirdrop(
      testUser3.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature3);

    const airdropSignature4 = await provider.connection.requestAirdrop(
      testUser4.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature4);

    const airdropSignature5 = await provider.connection.requestAirdrop(
      testUser5.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature5);

    const airdropSignature6 = await provider.connection.requestAirdrop(
      testUser6.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature6);

    // Find the whitelist PDA
    [whitelistAccount, whitelistBump] = await PublicKey.findProgramAddress(
      [Buffer.from("whitelist_seed"), owner.toBuffer()],
      program.programId
    );
  });

  it("Creates a new whitelist", async () => {
    // Prepare test data
    const whitelistName = "mingyuseon";

    // Execute the transaction
    await program.methods
      .createWhitelist(whitelistName, testUser1.publicKey)
      .accounts({
        whitelistAccount: whitelistAccount,
        owner: owner,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fetch the account and check if it was initialized correctly
    const account = await program.account.whitelist.fetch(whitelistAccount);

    expect(account.name).to.equal(whitelistName);
    expect(account.users.length).to.equal(1);
    expect(account.users[0].toString()).to.equal(
      testUser1.publicKey.toString()
    );
  });

  it("Renames the whitelist", async () => {
    // Prepare test data
    const newName = "shinsejong";

    // Execute the transaction
    await program.methods
      .renameWhitelist(newName)
      .accounts({
        whitelistAccount: whitelistAccount,
        signer: testUser1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser1])
      .rpc();

    // Fetch the account and check if the name was updated
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.name).to.equal(newName);
  });

  it("Adds a user2 to the whitelist", async () => {
    // Execute the transaction
    await program.methods
      .addWhitelist(testUser2.publicKey)
      .accounts({
        whitelistAccount: whitelistAccount,
        signer: testUser1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser1])
      .rpc();

    // Fetch the account and check if the user was added
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.users.length).to.equal(2);
    expect(account.users[1].toString()).to.equal(
      testUser2.publicKey.toString()
    );
  });

  it("Adds a user3 to the whitelist", async () => {
    // Execute the transaction
    await program.methods
      .addWhitelist(testUser3.publicKey)
      .accounts({
        whitelistAccount: whitelistAccount,
        signer: testUser2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser2])
      .rpc();

    // Fetch the account and check if the user was added
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.users.length).to.equal(3);
    expect(account.users[2].toString()).to.equal(
      testUser3.publicKey.toString()
    );
  });

  it("Adds a user4 to the whitelist", async () => {
    // Execute the transaction
    await program.methods
      .addWhitelist(testUser4.publicKey)
      .accounts({
        whitelistAccount: whitelistAccount,
        signer: testUser2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser2])
      .rpc();

    // Fetch the account and check if the user was added
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.users.length).to.equal(4);
    expect(account.users[3].toString()).to.equal(
      testUser4.publicKey.toString()
    );
  });

  it("Adds a user5 to the whitelist", async () => {
    // Execute the transaction
    await program.methods
      .addWhitelist(testUser5.publicKey)
      .accounts({
        whitelistAccount: whitelistAccount,
        signer: testUser4.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser4])
      .rpc();

    // Fetch the account and check if the user was added
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.users.length).to.equal(5);
    expect(account.users[4].toString()).to.equal(
      testUser5.publicKey.toString()
    );
  });

  it("Adds a user6 to the whitelist", async () => {
    // Execute the transaction
    await program.methods
      .addWhitelist(testUser6.publicKey)
      .accounts({
        whitelistAccount: whitelistAccount,
        signer: testUser4.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser4])
      .rpc();

    // Fetch the account and check if the user was added
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.users.length).to.equal(5);
    // expect(account.users[1].toString()).to.equal(
    //   testUser6.publicKey.toString()
    // );
  });

  it("Doesn't add duplicate users", async () => {
    // Try to add the same user again
    await program.methods
      .addWhitelist(testUser2.publicKey)
      .accounts({
        whitelistAccount: whitelistAccount,
        signer: testUser1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser1])
      .rpc();

    // Fetch the account and check that no duplicates were added
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.users.length).to.equal(5);
  });

  it("Fails when unauthorized user tries to update whitelist", async () => {
    // Create a random user not in the whitelist
    const unauthorizedUser = anchor.web3.Keypair.generate();

    // Airdrop SOL to this user
    const airdropSignature = await provider.connection.requestAirdrop(
      unauthorizedUser.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    // Try to rename the whitelist with an unauthorized user
    try {
      await program.methods
        .renameWhitelist("Unauthorized Update")
        .accounts({
          whitelistAccount: whitelistAccount,
          signer: unauthorizedUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([unauthorizedUser])
        .rpc();

      // If we reach here, the test failed
      expect.fail("Transaction should have failed with unauthorized error");
    } catch (error) {
      expect(error.message).to.include("Unauthorized");
    }
  });

  it("Deletes a user from the whitelist", async () => {
    // Execute the transaction
    await program.methods
      .deleteWhitelist(testUser2.publicKey)
      .accounts({
        whitelistAccount: whitelistAccount,
        signer: testUser1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser1])
      .rpc();

    // Fetch the account and check if the user was removed
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.users.length).to.equal(4);
    expect(account.users).to.not.include(testUser1.publicKey);
  });

  it("Fails when unauthorized user tries to delete whitelist", async () => {
    try {
      // Execute the transaction
      await program.methods
        .deleteWhitelist(testUser2.publicKey)
        .accounts({
          whitelistAccount: whitelistAccount,
          signer: testUser6.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([testUser6])
        .rpc();

      // If we reach here, the test failed
      expect.fail("Transaction should have failed with unauthorized error");
    } catch (error) {
      expect(error.message).to.include("Unauthorized");
    }

    // Fetch the account and check if the user was removed
    const account = await program.account.whitelist.fetch(whitelistAccount);
    expect(account.users.length).to.equal(4);
  });
});
