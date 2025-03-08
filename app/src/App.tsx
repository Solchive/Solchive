import React, { useEffect, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

import Dashboard from "./components/Dashboard/Dashboard";
import TopBar from "./components/TopBar/TopBar";
import WhitelistState from "./components/whitelist-state";
import { getAllSharedDatabases } from "./anchor/setup";

const App = () => {
  const network = WalletAdapterNetwork.Devnet;

  // devnet
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  // localhost
  const endpoint = useMemo(() => "http://127.0.0.1:8899", []);
  const wallets = useMemo(() => [], [network]);

  useEffect(() => {
    if (!wallets) return;
    const getData = async () => {
      const allDatabases = await getAllSharedDatabases();
      console.log(allDatabases);
    };
    getData();
  }, [wallets]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <div className="w-[100vw] h-[100vh] overflow-hidden sflex flex-col">
              <TopBar />
              <Dashboard />
            </div>
          </BrowserRouter>
          {/* <WhitelistState /> */}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
