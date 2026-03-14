import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "../hooks/useProgram";
import { useEventData } from "../hooks/useEventData";
import TransactionToast from "../components/TransactionToast";
import { DEMO_EVENT_NAME, lamportsToSol, bpsToPercent } from "../utils/constants";

const DEMO_EVENT_PDA = ""; // TODO Person A: fill in after anchor deploy

export default function EventPage() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const { event, loading } = useEventData(DEMO_EVENT_PDA || null);
  const [txStatus, setTxStatus] = useState<"success" | "error" | "pending" | null>(null);
  const [txMessage, setTxMessage] = useState("");
  const [txSig, setTxSig] = useState<string | undefined>();

  const handleBuy = async () => {
    if (!program || !publicKey) { alert("Connect your wallet first"); return; }
    setTxStatus("pending");
    setTxMessage("Purchasing ticket...");
    try {
      // TODO Person C: wire purchase_ticket instruction here
      setTxStatus("success");
      setTxMessage("Ticket purchased! Check My Tickets.");
    } catch (err: any) {
      setTxStatus("error");
      setTxMessage(err.message || "Purchase failed");
    }
  };

  const displayEvent = event ?? { name: DEMO_EVENT_NAME, facePrice: 65_000_000, maxResaleBps: 11000, totalSupply: 10, ticketsSold: 3, isActive: true };
  if (loading) return <p>Loading event...</p>;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>{displayEvent.name}</h2>
      <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{lamportsToSol(displayEvent.facePrice)} SOL</p>
      <p style={{ color: "#555" }}>{displayEvent.ticketsSold} / {displayEvent.totalSupply} tickets sold</p>
      <p style={{ color: "#888", fontSize: 14 }}>Max resale: {lamportsToSol(displayEvent.facePrice * bpsToPercent(displayEvent.maxResaleBps) / 100).toFixed(4)} SOL</p>
      {displayEvent.isActive
        ? <button onClick={handleBuy} disabled={!publicKey || txStatus === "pending"} style={{ marginTop: "1rem", padding: "0.75rem 2rem", fontSize: "1rem", cursor: "pointer", background: "#000", color: "#fff", border: "none", borderRadius: 8 }}>
            {!publicKey ? "Connect Wallet to Buy" : txStatus === "pending" ? "Buying..." : `Buy Ticket — ${lamportsToSol(displayEvent.facePrice)} SOL`}
          </button>
        : <p style={{ color: "#e55", fontWeight: 600 }}>This event is not active.</p>}
      <TransactionToast status={txStatus} message={txMessage} txSignature={txSig} />
    </div>
  );
}