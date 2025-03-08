import * as React from "react";

import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { SolarchiveClient } from "@/services/solarchive";

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

  // Database 관련
  const [name, setName] = React.useState("");
  const [dataType, setDataType] = React.useState("");
  const [jsonFile, setJsonFile] = React.useState<File | null>(null);
  const handleCreateDatabase = async () => {
    try {
      const fileContent = await jsonFile?.text();
      if (!fileContent) throw new Error("Please upload the json file");

      // const dataAccount = await solarchiveClient.initializeData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className={`h-[90vh] px-4 py-2 ${isShowWhitelist && "bg-gray-50"}`}
    >
      <SidebarHeader>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="defaultViolet"
              onClick={() => {
                if (isShowWhitelist) {
                  // TODO
                } else {
                  handleCreateDatabase();
                }
              }}
            >
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Trading Database - 2025"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Data Type
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3 w-full">
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
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
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="defaultViolet" type="submit">
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
