import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useProgram } from "../hooks/useProgram";
import TransactionToast from "../components/TransactionToast";
import { DEMO_EVENT_NAME, DEMO_FACE_PRICE_LAMPORTS, DEMO_MAX_RESALE_BPS, DEMO_TICKET_SUPPLY, lamportsToSol, bpsToPercent } from "../utils/constants";

export default function CreateEvent() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [name, setName] = useState(DEMO_EVENT_NAME);
  const [supply, setSupply] = useState(DEMO_TICKET_SUPPLY);
  const [facePrice, setFacePrice] = useState(lamportsToSol(DEMO_FACE_PRICE_LAMPORTS));
  const [resaleCap, setResaleCap] = useState(bpsToPercent(DEMO_MAX_RESALE_BPS));
  const [txStatus, setTxStatus] = useState<"success" | "error" | "pending" | null>(null);
  const [txMessage, setTxMessage] = useState("");
  const [txSig, setTxSig] = useState<string | undefined>();

  const handleCreate = async () => {
    if (!program || !publicKey) { alert("Connect your wallet first"); return; }
    setTxStatus("pending");
    setTxMessage("Creating event on-chain...");
    try {
      const maxResaleBps = Math.round(resaleCap * 100);
      const facePriceLamports = Math.round(facePrice * 1_000_000_000);
      const [eventPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("event"), publicKey.toBuffer(), Buffer.from(name)], program.programId
      );
      const [ticketMintPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("ticket_mint"), eventPDA.toBuffer()], program.programId
      );
      const sig = await (program.methods as any)
        .createEvent(name, supply, facePriceLamports, maxResaleBps)
        .accounts({ event: eventPDA, ticketMint: ticketMintPDA, organizer: publicKey, tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId, rent: SYSVAR_RENT_PUBKEY })
        .rpc();
      setTxStatus("success");
      setTxMessage(`Event "${name}" created! ${supply} tickets at ${facePrice} SOL each.`);
      setTxSig(sig);
    } catch (err: any) {
      setTxStatus("error");
      setTxMessage(err.message || "Transaction failed");
    }
  };

  if (!publicKey) return <p>Connect your wallet to create an event.</p>;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Create Event</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>Event Name<input value={name} onChange={e => setName(e.target.value)} style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }} /></label>
        <label>Ticket Supply<input type="number" value={supply} onChange={e => setSupply(Number(e.target.value))} style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }} /></label>
        <label>Face Price (SOL)<input type="number" step="0.001" value={facePrice} onChange={e => setFacePrice(Number(e.target.value))} style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }} /></label>
        <label>Max Resale Cap (%)
          <input type="number" value={resaleCap} onChange={e => setResaleCap(Number(e.target.value))} style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }} />
          <small style={{ color: "#888" }}>Max resale: {((facePrice * resaleCap) / 100).toFixed(4)} SOL</small>
        </label>
        <button onClick={handleCreate} disabled={txStatus === "pending"} style={{ padding: "0.75rem", fontSize: "1rem", cursor: "pointer", background: "#000", color: "#fff", border: "none", borderRadius: 8 }}>
          {txStatus === "pending" ? "Creating..." : "Create Event on Solana"}
        </button>
      </div>
      <TransactionToast status={txStatus} message={txMessage} txSignature={txSig} />
    </div>
  );
}