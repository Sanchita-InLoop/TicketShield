import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "../utils/constants";
import idl from "../idl/ticketshield.json";

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;
    const provider = new AnchorProvider(connection, {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    }, { commitment: "confirmed" });
    return new Program(idl as Idl, new PublicKey(PROGRAM_ID), provider);
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);
}