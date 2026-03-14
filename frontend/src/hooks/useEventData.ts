import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { PROGRAM_ID } from "../utils/constants";
import idl from "../idl/ticketshield.json";

export interface EventData {
  organizer: string;
  name: string;
  facePrice: number;
  maxResaleBps: number;
  totalSupply: number;
  ticketsSold: number;
  isActive: boolean;
  ticketMint: string;
}

export function useEventData(eventPDA: string | null) {
  const { connection } = useConnection();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventPDA) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const provider = new AnchorProvider(connection, {} as any, {});
        const program = new Program(idl as Idl, new PublicKey(PROGRAM_ID), provider);
        const data = await program.account.event.fetch(new PublicKey(eventPDA));
        setEvent({
          organizer: data.organizer.toString(),
          name: data.name as string,
          facePrice: (data.facePrice as any).toNumber(),
          maxResaleBps: data.maxResaleBps as number,
          totalSupply: data.totalSupply as number,
          ticketsSold: data.ticketsSold as number,
          isActive: data.isActive as boolean,
          ticketMint: data.ticketMint.toString(),
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [eventPDA, connection]);

  return { event, loading, error };
}