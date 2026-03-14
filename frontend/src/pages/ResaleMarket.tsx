import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import TransactionToast from "../components/TransactionToast";
import { lamportsToSol, DEMO_FACE_PRICE_LAMPORTS, DEMO_MAX_RESALE_BPS } from "../utils/constants";

interface Listing { id: string; eventName: string; seller: string; askingPrice: number; facePrice: number; maxResaleBps: number; isWithinCap: boolean; }

export default function ResaleMarket() {
  const { publicKey } = useWallet();
  const [txStatus, setTxStatus] = useState<"success" | "error" | "pending" | null>(null);
  const [txMessage, setTxMessage] = useState("");

  const maxAllowed = (DEMO_FACE_PRICE_LAMPORTS * DEMO_MAX_RESALE_BPS) / 10000;
  const mockListings: Listing[] = [
    { id: "1", eventName: "Coldplay India — Mumbai", seller: "ABC...XYZ", askingPrice: 70_000_000, facePrice: DEMO_FACE_PRICE_LAMPORTS, maxResaleBps: DEMO_MAX_RESALE_BPS, isWithinCap: true },
    { id: "2", eventName: "Coldplay India — Mumbai", seller: "DEF...UVW", askingPrice: 320_000_000, facePrice: DEMO_FACE_PRICE_LAMPORTS, maxResaleBps: DEMO_MAX_RESALE_BPS, isWithinCap: false },
  ];

  const handleBuy = async (listing: Listing) => {
    if (!publicKey) { alert("Connect wallet first"); return; }
    setTxStatus("pending");
    setTxMessage(`Attempting to buy at ${lamportsToSol(listing.askingPrice)} SOL...`);
    // TODO Person D: wire buy_listed_ticket instruction here
    setTimeout(() => {
      if (!listing.isWithinCap) {
        setTxStatus("error");
        setTxMessage(`Transaction rejected: ResalePriceTooHigh. ${lamportsToSol(listing.askingPrice)} SOL exceeds max ${lamportsToSol(maxAllowed)} SOL. The code doesn't take bribes.`);
      } else {
        setTxStatus("success");
        setTxMessage(`Ticket purchased at ${lamportsToSol(listing.askingPrice)} SOL!`);
      }
    }, 1500);
  };

  return (
    <div>
      <h2>Resale Market</h2>
      <p style={{ color: "#555" }}>All resales are capped at {DEMO_MAX_RESALE_BPS / 100}% of face value.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 560 }}>
        {mockListings.map(listing => (
          <div key={listing.id} style={{ border: `1px solid ${listing.isWithinCap ? "#ddd" : "#fca5a5"}`, borderRadius: 12, padding: "1rem 1.5rem", background: listing.isWithinCap ? "#fff" : "#fff5f5" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 0.25rem" }}>{listing.eventName}</h4>
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Seller: {listing.seller}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem", color: listing.isWithinCap ? "#000" : "#e55" }}>{lamportsToSol(listing.askingPrice)} SOL</p>
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Face: {lamportsToSol(listing.facePrice)} SOL</p>
              </div>
            </div>
            {!listing.isWithinCap && <p style={{ margin: "0.5rem 0 0", color: "#e55", fontSize: 13, fontWeight: 500 }}>⚠ Exceeds max {lamportsToSol(maxAllowed)} SOL — WILL be rejected by contract.</p>}
            <button onClick={() => handleBuy(listing)} style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", cursor: "pointer", background: listing.isWithinCap ? "#000" : "#e55", color: "#fff", border: "none", borderRadius: 6 }}>
              {listing.isWithinCap ? "Buy Ticket" : "Try to Buy (Will Fail)"}
            </button>
          </div>
        ))}
      </div>
      <TransactionToast status={txStatus} message={txMessage} />
    </div>
  );
}