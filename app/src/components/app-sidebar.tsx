import * as React from "react";

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
  Wallet,
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
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  appendSplitData,
  createSharedDatabase,
  getAllSharedDatabases,
  getOwnerSplitData,
  initializeData,
  program,
  programId,
} from "@/anchor/setup";
import { AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { toast } from "sonner";
import { useWhitelistStore } from "@/store/whitelistStore";
import { useDatabaseStore } from "@/store/databaseStore";
import { dummy1 } from "./Table/DatabaseTable/dummy";
import { usePoolStore } from "@/store/poolStore";
import { Checkbox } from "./ui/checkbox";

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
  // 전역변수
  const { whitelists, addWhitelist, fetchWhitelists } = useWhitelistStore();
  const { databases, addDatabase, addDatabaseItem, removeDatabaseItem } =
    useDatabaseStore();
  const { setPoolAmount } = usePoolStore();

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

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = React.useState<string>("");
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  // Database 관련
  const [name, setName] = React.useState("database");
  const [dataType, setDataType] = React.useState("default");
  const [jsonFile, setJsonFile] = React.useState<File | undefined>(undefined);
  const handleCreateDatabase = async () => {
    try {
      if (!publicKey || !connected || !anchorWallet) {
        throw new Error("Please connect the wallet.");
      }
      setIsLoading(true);
      setLoadingMessage("Loading...");

      if (!name || !dataType) return;
      // const fileContent = await jsonFile?.text();
      // if (!fileContent) throw new Error("Please upload the json file");

      const splitDataKeypair = Keypair.generate();
      const databaseKeypair = Keypair.generate();

      const chunks = chunkData(testData.records);

      let prevDataAccount = null;
      let lastTransactionId = null;

      // 1. 초기화
      const initInstruction = await initializeData(
        splitDataKeypair,
        anchorWallet.publicKey,
        anchorWallet
      );
      const initTx = new Transaction().add(initInstruction);
      initTx.feePayer = anchorWallet.publicKey;
      initTx.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      initTx.partialSign(splitDataKeypair);
      const signedInitTx = await anchorWallet.signTransaction(initTx);

      const rawInitTx = signedInitTx.serialize();
      const initSignature = await connection.sendRawTransaction(rawInitTx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      });
      await connection.confirmTransaction(initSignature);
      console.log("초기화 완료:", initSignature);

      // // 2. Append data
      // console.log("\n첫 번째 청크 저장 중...");
      // console.log("Data being sent:", {
      //   chunks: chunks[0],
      // });

      // const appendInstruction = await appendSplitData(
      //   splitDataKeypair,
      //   chunks[0],
      //   lastTransactionId,
      //   prevDataAccount,
      //   anchorWallet.publicKey,
      //   anchorWallet
      // );
      // const appendTx = new Transaction().add(appendInstruction);
      // appendTx.feePayer = anchorWallet.publicKey;
      // appendTx.recentBlockhash = (
      //   await connection.getLatestBlockhash()
      // ).blockhash;
      // // appendTx.partialSign(splitDataKeypair);
      // const signedAppendTx = await anchorWallet.signTransaction(appendTx);

      // const rawAppendTx = signedAppendTx.serialize();
      // const appendSignature = await connection.sendRawTransaction(rawAppendTx, {
      //   skipPreflight: false,
      //   preflightCommitment: "confirmed",
      //   maxRetries: 5,
      // });
      // await connection.confirmTransaction(appendSignature);

      // prevDataAccount = splitDataKeypair.publicKey;
      // lastTransactionId = appendSignature;
      // console.log("첫 번째 청크 저장 완료:", appendSignature);

      // // 3. 나머지 청크 저장
      // console.log("\n나머지 청크 저장 중...");
      // for (let i = 1; i < chunks.length; i++) {
      //   const nextAppendInstruction = await appendSplitData(
      //     splitDataKeypair,
      //     chunks[i],
      //     lastTransactionId,
      //     prevDataAccount,
      //     anchorWallet.publicKey,
      //     anchorWallet
      //   );
      //   const nextTx = new Transaction().add(nextAppendInstruction);
      //   nextTx.feePayer = anchorWallet.publicKey;
      //   nextTx.recentBlockhash = (
      //     await connection.getLatestBlockhash()
      //   ).blockhash;
      //   nextTx.partialSign(splitDataKeypair);
      //   const signedNextTx = await anchorWallet.signTransaction(nextTx);

      //   const rawNextTx = signedNextTx.serialize();
      //   const nextSignature = await connection.sendRawTransaction(rawNextTx, {
      //     skipPreflight: false,
      //     preflightCommitment: "confirmed",
      //     maxRetries: 5,
      //   });
      //   await connection.confirmTransaction(nextSignature);
      //   prevDataAccount = splitDataKeypair.publicKey;
      //   lastTransactionId = nextSignature;
      //   console.log(`청크 ${i + 1} 저장 완료:`, nextSignature);

      //   // 트랜잭션 간 딜레이
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      // }

      // // 4. 데이터베이스 생성
      // console.log("\n데이터베이스 생성 중...", name, dataType);
      // console.log("Database creation parameters:", {
      //   name,
      //   dataType,
      //   splitDataPublicKey: splitDataKeypair.publicKey.toString(),
      //   databasePublicKey: databaseKeypair.publicKey.toString(),
      //   ownerPublicKey: anchorWallet.publicKey.toString(),
      //   programId: programId.toString(),
      // });

      // // 계정이 이미 존재하는지 확인
      // const existingAccount = await connection.getAccountInfo(
      //   databaseKeypair.publicKey
      // );
      // console.log("Existing account check:", existingAccount);

      // try {
      //   // 계정 생성 instruction
      //   // const createAccountInstruction = SystemProgram.createAccount({
      //   //   fromPubkey: anchorWallet.publicKey,
      //   //   newAccountPubkey: databaseKeypair.publicKey,
      //   //   lamports,
      //   //   space,
      //   //   programId: program.programId,
      //   // });

      //   const dbInstruction = await createSharedDatabase(
      //     databaseKeypair,
      //     name,
      //     dataType,
      //     splitDataKeypair.publicKey,
      //     anchorWallet
      //   );
      //   const dbTx = new Transaction().add(dbInstruction);
      //   dbTx.feePayer = anchorWallet.publicKey;
      //   const latestBlockhash = await connection.getLatestBlockhash();
      //   dbTx.recentBlockhash = latestBlockhash.blockhash;
      //   // dbTx.recentBlockhash = (
      //   //   await connection.getLatestBlockhash()
      //   // ).blockhash;
      //   dbTx.partialSign(databaseKeypair);

      //   const simulation = await connection.simulateTransaction(dbTx);
      //   console.log("시뮬레이션 상세 결과:", {
      //     err: simulation.value.err,
      //     logs: simulation.value.logs,
      //     unitsConsumed: simulation.value.unitsConsumed,
      //   });
      //   const signedDbTx = await anchorWallet.signTransaction(dbTx);
      //   console.log("Transaction details:", {
      //     signature: signedDbTx.signatures.map((s) => s.publicKey.toString()),
      //     accounts: dbTx.instructions[0].keys.map((k) => ({
      //       pubkey: k.pubkey.toString(),
      //       isSigner: k.isSigner,
      //       isWritable: k.isWritable,
      //     })),
      //   });
      //   const rawDbTx = signedDbTx.serialize();
      //   const dbSignature = await connection.sendRawTransaction(rawDbTx, {
      //     skipPreflight: false,
      //     preflightCommitment: "confirmed",
      //     maxRetries: 5,
      //   });

      //   const confirmation = await connection.confirmTransaction(dbSignature);
      //   console.log("데이터베이스 생성 완료:", dbInstruction, confirmation);
      //   const accountInfo = await connection.getAccountInfo(
      //     databaseKeypair.publicKey
      //   );
      //   console.log("생성된 계정 정보:", accountInfo);

      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      //   const db = await getAllSharedDatabases();
      //   console.log(db);
      // } catch (error) {
      //   console.error(error);
      // }

      setName("");
      setDataType("");
      setJsonFile(undefined);
      setIsLoading(false);
      setLoadingMessage("");

      // addDatabase({
      //   title: "Whitelist1",
      //   url: "/DKSu7g5xYpwjgsCVSVaFAFDNKuZMcZ7xR6MwKALGdAHH",
      //   iconName: "Database",
      //   isActive: true,
      //   items: [
      //     {
      //       title: "Data1",
      //       url: "/DKSu7g5xYpwjgsCVSVaFAFDNKuZMcZ7xR6MwKALGdAHH/9qQVcJyg3Sm1VXz6X2RQv3Lwgz9KvmN8KbgLBzQPcPU1",
      //     },
      //   ],
      // });
      addDatabaseItem("Whitelist1", {
        title: "Data3",
        url: "3vZ6mUMGmZ8hntZ4Dz6PHP3YDUFMJRYUmxe9er6xGHGP",
      });
      setTimeout(() => {
        setPoolAmount(0.02);
      }, 3000);
    } catch (error) {
      console.error(error);
      setLoadingMessage("Failed.");
    }
  };

  const handleDialogOpen = () => {
    if (!isShowWhitelist && whitelists.length === 0) {
      toast("Notice", {
        description: "Please create new Whitelist first.",
        style: { color: "red" },
      });
      return false;
    }
    return true;
  };
  const handleDialogClose = () => {
    setLoadingMessage("");
    setIsLoading(false);
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className={`h-[90vh] px-4 py-2 transition-colors duration-300 ease-in-out ${
        isShowWhitelist ? "bg-violet-50" : "bg-white"
      }`}
    >
      <SidebarHeader>
        <Dialog onOpenChange={(open) => !open && handleDialogClose()}>
          <DialogTrigger
            asChild
            onClick={(e) => !handleDialogOpen() && e.preventDefault()}
          >
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
                      className="col-span-3 required:border-red-500"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Members (max 5)</h4>
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
                            className="col-span-3 required:border-red-500"
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Trading Database - 2025"
                      className="col-span-3 required:border-red-500"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Data Type
                    </Label>
                    <Select
                      onValueChange={(value) => setDataType(value)}
                      defaultValue="default"
                    >
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
                      className="col-span-3 required:border-red-500"
                      onChange={(e) => setJsonFile(e.target.files?.[0])}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="gap-4 items-center">
              {isLoading && (
                <div className="text-sm text-red-500">{loadingMessage}</div>
              )}
              <div className="flex gap-1">
                <Checkbox>Use Pool Amount</Checkbox>
                <Label className="text-gray-500">Use Pool Amount</Label>
              </div>
              <Button
                variant="defaultViolet"
                type="submit"
                onClick={() => {
                  isShowWhitelist
                    ? addWhitelist({
                        title: "Whitelist1",
                        url: "/DKSu7g5xYpwjgsCVSVaFAFDNKuZMcZ7xR6MwKALGdAHH",
                        iconName: "Wallet",
                        isActive: true,
                        items: [
                          {
                            title: "Member1",
                            subTitle:
                              "8QtksrK5uL7jARoXYop4AvXBRuiBgxfqr5gT5Rq4zZ5r",
                            url: "/DKSu7g5xYpwjgsCVSVaFAFDNKuZMcZ7xR6MwKALGdAHH",
                          },
                          {
                            title: "Member2",
                            subTitle:
                              "4D7uLzJphkdrbETYXnQxxcmWw6hLjTpc95LSVLja7LrQ",
                            url: "/DKSu7g5xYpwjgsCVSVaFAFDNKuZMcZ7xR6MwKALGdAHH",
                          },
                        ],
                      })
                    : handleCreateDatabase();
                }}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="defaultWhite">+ Add</Button>
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => {
            const cf = confirm("Are you sure you want to start remove?");
            if (cf) {
              // removeDatabaseItem("Whitelist1", "Data1");
              setTimeout(() => {
                setPoolAmount(0.04);
              }, 3000);
            }
          }}
        >
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
