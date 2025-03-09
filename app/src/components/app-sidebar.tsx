import * as React from "react";

import * as anchor from "@coral-xyz/anchor";

import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { chunkData, createNewDatabase } from "@/utils/createNewDatabase";
import * as pako from "pako";
import testData from "../utils/test.json";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Pen,
  PlusCircle,
  Trash2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  appendSplitData,
  createSharedDatabase,
  initializeData,
  AnchorWallet,
} from "@/anchor/setup";
import {
  connection,
  getProgram,
  createWhitelist,
  renameWhitelist,
  addWhitelist,
  deleteWhitelist,
} from "@/anchor/whitelist_setup";

export function AppSidebar({
  data,
  isShowWhitelist,
  setIsShowWhitelist,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  data: any;
  isShowWhitelist: boolean;
  setIsShowWhitelist: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // const { publicKey, wallet, connected, signTransaction, signAllTransactions } =
  //   useWallet();
  // const [whitelistAccount, setWhitelistAccount] =
  //   React.useState<PublicKey | null>(null);
  // React.useEffect(() => {
  //   if (publicKey) {
  //     // Calculate the PDA for the whitelist account
  //     const findWhitelistPDA = async () => {
  //       if (!wallet || !publicKey) return;

  //       const anchorWallet: AnchorWallet = {
  //         publicKey,
  //         signTransaction,
  //         signAllTransactions,
  //       };

  //       const program = getProgram(anchorWallet);
  //       const [whitelistPDA] = PublicKey.findProgramAddressSync(
  //         [Buffer.from("whitelist_seed"), publicKey.toBuffer()],
  //         program.programId
  //       );

  //       setWhitelistAccount(whitelistPDA);
  //     };

  //     findWhitelistPDA();
  //   }
  // }, [publicKey, wallet]);

  // Whitelist 관련
  const [people, setPeople] = React.useState([{ name: "" }]);
  const addPerson = () => {
    setPeople([...people, { name: "" }]);
  };
  const removePerson = (index: number) => {
    const newPeople = people.filter((_, i) => i !== index);
    setPeople(newPeople);
  };
  const handlePersonChange = (index: number, value: string) => {
    const newPeople = [...people];
    newPeople[index].name = value;
    setPeople(newPeople);
  };

  const [whitelistName, setWhitelistName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = React.useState<string>("");
  const { publicKey, connected, wallet, signTransaction, signAllTransactions } =
    useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  // const createWhitelist = async (
  //   name: string,
  //   user: PublicKey,
  //   publicKey: PublicKey,
  //   wallet: AnchorWallet
  // ) => {
  //   const program = getProgram(wallet);

  //   // Create the PDA for whitelist account
  //   const [whitelistPDA] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("whitelist_seed"), publicKey.toBuffer()],
  //     program.programId
  //   );

  //   // Find the whitelist PDA
  //   [whitelistAccount, whitelistBump] = await PublicKey.findProgramAddress(
  //     [Buffer.from("whitelist_seed"), publicKey.toBuffer()],
  //     program.programId
  //   );

  //   const tx = await program.methods
  //     .createWhitelist(whitelistName, publicKey)
  //     .accounts({
  //       whitelistAccount: whitelistAccount,
  //       owner: owner,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .rpc();
  //   // .instruction();

  //   return tx;
  // };

  // const handleAddUser = async () => {
  //   if (!connected || !publicKey || !wallet || !whitelistAccount) {
  //     setMessage("지갑이 연결되지 않았거나 화이트리스트가 없습니다");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setMessage("사용자 추가 중...");

  //     let userPubkey: PublicKey;
  //     try {
  //       userPubkey = new PublicKey(userToAdd);
  //     } catch (e) {
  //       setMessage("유효한 Solana 공개키를 입력해주세요");
  //       setLoading(false);
  //       return;
  //     }

  //     const instruction = await addWhitelist(
  //       whitelistAccount,
  //       userPubkey,
  //       publicKey,
  //       wallet
  //     );

  //     const connection = getConnection();
  //     const transaction = new Transaction().add(instruction);

  //     const { blockhash } = await connection.getLatestBlockhash();
  //     transaction.recentBlockhash = blockhash;
  //     transaction.feePayer = publicKey;

  //     const signedTx = await wallet.signTransaction(transaction);
  //     const txid = await connection.sendRawTransaction(signedTx.serialize());

  //     await connection.confirmTransaction(txid);

  //     setMessage(`사용자가 성공적으로 추가되었습니다. Tx ID: ${txid}`);
  //     setUserToAdd("");
  //   } catch (error) {
  //     console.error("사용자 추가 오류:", error);
  //     setMessage(
  //       `오류: ${error instanceof Error ? error.message : String(error)}`
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDeleteUser = async () => {
  //   if (!connected || !publicKey || !wallet || !whitelistAccount) {
  //     setMessage("지갑이 연결되지 않았거나 화이트리스트가 없습니다");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setMessage("사용자 삭제 중...");

  //     let userPubkey: PublicKey;
  //     try {
  //       userPubkey = new PublicKey(userToDelete);
  //     } catch (e) {
  //       setMessage("유효한 Solana 공개키를 입력해주세요");
  //       setLoading(false);
  //       return;
  //     }

  //     const instruction = await deleteWhitelist(
  //       whitelistAccount,
  //       userPubkey,
  //       publicKey,
  //       wallet
  //     );

  //     const connection = getConnection();
  //     const transaction = new Transaction().add(instruction);

  //     const { blockhash } = await connection.getLatestBlockhash();
  //     transaction.recentBlockhash = blockhash;
  //     transaction.feePayer = publicKey;

  //     const signedTx = await wallet.signTransaction(transaction);
  //     const txid = await connection.sendRawTransaction(signedTx.serialize());

  //     await connection.confirmTransaction(txid);

  //     setMessage(`사용자가 성공적으로 삭제되었습니다. Tx ID: ${txid}`);
  //     setUserToDelete("");
  //   } catch (error) {
  //     console.error("사용자 삭제 오류:", error);
  //     setMessage(
  //       `오류: ${error instanceof Error ? error.message : String(error)}`
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleRenameWhitelist = async () => {
  //   if (!connected || !publicKey || !wallet || !whitelistAccount) {
  //     setMessage("지갑이 연결되지 않았거나 화이트리스트가 없습니다");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setMessage("화이트리스트 이름 변경 중...");

  //     const instruction = await renameWhitelist(
  //       whitelistAccount,
  //       newName,
  //       publicKey,
  //       wallet
  //     );

  //     const connection = getConnection();
  //     const transaction = new Transaction().add(instruction);

  //     const { blockhash } = await connection.getLatestBlockhash();
  //     transaction.recentBlockhash = blockhash;
  //     transaction.feePayer = publicKey;

  //     const signedTx = await wallet.signTransaction(transaction);
  //     const txid = await connection.sendRawTransaction(signedTx.serialize());

  //     await connection.confirmTransaction(txid);

  //     setMessage(`화이트리스트 이름이 변경되었습니다. Tx ID: ${txid}`);
  //     setNewName("");
  //   } catch (error) {
  //     console.error("이름 변경 오류:", error);
  //     setMessage(
  //       `오류: ${error instanceof Error ? error.message : String(error)}`
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Database 관련
  // const [name, setName] = React.useState("");
  // const [dataType, setDataType] = React.useState("");
  // const [jsonFile, setJsonFile] = React.useState<File | undefined>(undefined);
  // const handleCreateDatabase = async () => {
  //   try {
  //     if (!publicKey || !connected || !anchorWallet) {
  //       throw new Error("Please connect the wallet.");
  //     }
  //     setIsLoading(true);
  //     setLoadingMessage("Loading...");

  //     // const fileContent = await jsonFile?.text();
  //     // if (!fileContent) throw new Error("Please upload the json file");

  //     const splitDataKeypair = Keypair.generate();
  //     console.log("splitDataKeypair: ", splitDataKeypair);
  //     const databaseKeypair = Keypair.generate();

  //     const chunks = chunkData(testData.records);
  //     let prevDataAccount = null;
  //     let lastTransactionId = null;

  //     // 1. 초기화
  //     const initInstruction = await initializeData(
  //       splitDataKeypair,
  //       publicKey,
  //       anchorWallet
  //     );
  //     const initTx = new Transaction().add(initInstruction);
  //     initTx.feePayer = publicKey;
  //     initTx.recentBlockhash = (
  //       await connection.getLatestBlockhash()
  //     ).blockhash;
  //     await anchorWallet.signTransaction(initTx);
  //     initTx.partialSign(splitDataKeypair); // sign() 대신 partialSign() 사용
  //     const initSignature = await connection.sendTransaction(
  //       initTx,
  //       [splitDataKeypair],
  //       {
  //         skipPreflight: false,
  //         preflightCommitment: "confirmed",
  //         maxRetries: 5,
  //       }
  //     );
  //     await connection.confirmTransaction(initSignature);
  //     console.log("초기화 완료:", initSignature);

  //     // 2. SharedDatabase 생성
  //     console.log("\n첫 번째 청크 저장 중...");
  //     const appendInstruction = await appendSplitData(
  //       splitDataKeypair,
  //       chunks[0],
  //       null,
  //       undefined,
  //       publicKey,
  //       anchorWallet
  //     );
  //     const appendTx = new Transaction().add(appendInstruction);
  //     appendTx.feePayer = publicKey;
  //     appendTx.recentBlockhash = (
  //       await connection.getLatestBlockhash()
  //     ).blockhash;
  //     await anchorWallet.signTransaction(appendTx);
  //     appendTx.sign(splitDataKeypair);
  //     const appendSignature = await sendAndConfirmTransaction(
  //       connection,
  //       appendTx,
  //       [splitDataKeypair]
  //     );
  //     await connection.confirmTransaction(appendSignature);
  //     prevDataAccount = splitDataKeypair.publicKey;
  //     lastTransactionId = appendSignature;
  //     console.log("첫 번째 청크 저장 완료:", appendSignature);

  //     // 3. 나머지 청크 저장
  //     console.log("\n나머지 청크 저장 중...");
  //     for (let i = 1; i < chunks.length; i++) {
  //       const nextAppendInstruction = await appendSplitData(
  //         splitDataKeypair,
  //         chunks[i],
  //         lastTransactionId,
  //         prevDataAccount,
  //         publicKey,
  //         anchorWallet
  //       );
  //       const nextTx = new Transaction().add(nextAppendInstruction);
  //       nextTx.feePayer = publicKey;
  //       nextTx.recentBlockhash = (
  //         await connection.getLatestBlockhash()
  //       ).blockhash;
  //       await anchorWallet.signTransaction(nextTx);
  //       nextTx.sign(splitDataKeypair);
  //       const nextSignature = await sendAndConfirmTransaction(
  //         connection,
  //         nextTx,
  //         [splitDataKeypair]
  //       );
  //       await connection.confirmTransaction(nextSignature);
  //       prevDataAccount = splitDataKeypair.publicKey;
  //       lastTransactionId = nextSignature;
  //       console.log(`청크 ${i + 1} 저장 완료:`, nextSignature);

  //       // 트랜잭션 간 딜레이
  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //     }

  //     // 4. 데이터베이스 생성
  //     console.log("\n데이터베이스 생성 중...");
  //     const dbInstruction = await createSharedDatabase(
  //       databaseKeypair,
  //       name,
  //       dataType,
  //       splitDataKeypair.publicKey,
  //       publicKey,
  //       anchorWallet
  //     );
  //     const dbTx = new Transaction().add(dbInstruction);
  //     dbTx.feePayer = publicKey;
  //     dbTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  //     await anchorWallet.signTransaction(dbTx);
  //     dbTx.sign(databaseKeypair);
  //     const dbSignature = await sendAndConfirmTransaction(connection, dbTx, [
  //       databaseKeypair,
  //     ]);
  //     await connection.confirmTransaction(dbSignature);
  //     console.log("데이터베이스 생성 완료:", dbSignature);

  //     setName("");
  //     setDataType("");
  //     setJsonFile(undefined);
  //     setIsLoading(false);
  //     setLoadingMessage("");
  //   } catch (error) {
  //     console.error(error);
  //     setLoadingMessage("Transaction failed.");
  //   }
  // };

  const handleDialogClose = () => {
    setLoadingMessage("");
    setIsLoading(false);
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className={`h-[90vh] px-4 py-2 ${isShowWhitelist && "bg-gray-50"}`}
    >
      <SidebarHeader>
        <Dialog onOpenChange={(open) => !open && handleDialogClose()}>
          <DialogTrigger asChild>
            <Button variant="defaultViolet">
              <Pen />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Create New {isShowWhitelist ? "Whitelist" : "Database"}
              </DialogTitle>
              {!isShowWhitelist && (
                <DialogDescription>
                  The uploaded file must be in JSON format
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {isShowWhitelist ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Whitelist name (max 10 characters)"
                      className="col-span-3"
                      maxLength={10}
                      value={whitelistName}
                      onChange={(e) => {
                        setWhitelistName(e.target.value);
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Members</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => people.length < 5 && addPerson()}
                        disabled={people.length >= 5}
                      >
                        <PlusCircle />
                      </Button>
                    </div>
                    {people.map((person, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 items-center gap-4"
                      >
                        <Label
                          htmlFor={`person-${index}`}
                          className="text-right"
                        >
                          Member {index + 1}
                        </Label>
                        <div className="col-span-3 flex gap-2">
                          <Input
                            id={`person-${index}`}
                            value={person.name}
                            onChange={(e) =>
                              handlePersonChange(index, e.target.value)
                            }
                            placeholder="Please input wallet account"
                          />
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePerson(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Trading Database - 2025"
                      className="col-span-3"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Data Type
                    </Label>
                    <Select onValueChange={(value) => setDataType(value)}>
                      <SelectTrigger className="col-span-3 w-full">
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="chat">Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">
                      Upload File
                    </Label>
                    <Input
                      type="file"
                      accept=".json"
                      className="col-span-3 w-full"
                      onChange={(e) => setJsonFile(e.target.files?.[0])}
                    />
                  </div> */}
                </>
              )}
            </div>
            <DialogFooter className="gap-4 items-center">
              {isLoading && (
                <div className="text-sm text-red-500">{loadingMessage}</div>
              )}
              <Button
                variant="defaultViolet"
                type="submit"
                onClick={() => createWhitelist}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="defaultWhite">+ Add</Button>
        <Button variant="ghost" className="p-0">
          <Trash2 />
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={isShowWhitelist ? data.whitelist : data.database} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>

      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
        {/* <TeamSwitcher teams={data.teams} /> */}

        <Button
          variant="defaultViolet"
          size="xl"
          className={`justify-between ${
            isShowWhitelist ? "bg-[#a988ef] hover:bg-[#7F56D9]" : "bg-[#6941C6]"
          }`}
          onClick={() => setIsShowWhitelist(!isShowWhitelist)}
        >
          {isShowWhitelist ? "Show Database" : "Manage Whitelist"}
          {isShowWhitelist ? <ArrowDownCircle /> : <ArrowUpCircle />}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
