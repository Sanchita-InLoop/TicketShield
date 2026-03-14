import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { DEVNET_RPC } from "./utils/constants";
import App from "./App";
import "@solana/wallet-adapter-react-ui/styles.css";

const wallets = [new PhantomWalletAdapter()];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={DEVNET_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);