import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import logo from "@/assets/logo.svg";

const TopBar = () => {
  return (
    <div className="w-full flex justify-between items-center p-4">
      <div className="flex gap-2 items-center">
        <img src={logo} className="rounded-md" />
        <span className="text-lg font-bold">SOLCHIVE</span>
      </div>
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
  );
};

export default TopBar;
