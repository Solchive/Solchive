import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import { usePoolStore } from "@/store/poolStore";
import { useWhitelistStore } from "@/store/whitelistStore";

// import logo from "@/assets/logo.svg";
import logo from "@/assets/solchive-logo.png";
import solanaLogo from "@/assets/solana-logo.png";

import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "../ui/button";

const TopBar = () => {
  const { connected } = useWallet();
  const { poolAmount } = usePoolStore();
  const [whitelistId, databaseId] = window.location.pathname
    .split("/")
    .filter(Boolean);

  return (
    <div className="w-full h-[10vh] flex justify-between items-center p-4">
      <div className="h-full flex gap-3 items-center">
        <img src={logo} className="h-full" />
        {/* <span className="text-lg font-bold">Solchive</span> */}
      </div>
      <div className="flex gap-4">
        {connected && whitelistId && (
          <Button variant="defaultWhite" className="h-12">
            <img src={solanaLogo} className="h-full" />
            Pool : {poolAmount.toFixed(2)} Sol
          </Button>
        )}
        {window.solana?.isPhantom ? (
          <WalletMultiButton />
        ) : (
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="button px-4 py-0 bg-[#7F56D9] rounded-md text-white"
          >
            Download Wallet
          </a>
        )}
      </div>
    </div>
  );
};

export default TopBar;
