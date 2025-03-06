import React from "react";
import { BrowserRouter } from "react-router-dom";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// import {
//   PhantomWalletAdapter,
//   SolflareWalletAdapter,
// } from "@solana/wallet-adapter-wallets";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

import Dashboard from "./components/Dashboard/Dashboard";
import TopBar from "./components/TopBar/TopBar";

const App = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter({ network })],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <div className="h-screen flex flex-col">
              <TopBar />
              <div className="flex-1 overflow-auto">
                <Dashboard />
              </div>
            </div>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
