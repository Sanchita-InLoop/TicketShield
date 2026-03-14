import { useEffect, useState } from "react";
import { lamportsToSol } from "../utils/constants";

interface TxRecord { type: "sale" | "resale" | "rejection" | "listing"; signature: string; timestamp: string; from: string; to?: string; price: number; eventName: string; }

export default function Transparency() {
  const [records, setRecords] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO Person D: replace mock with real getProgramAccounts query
    setTimeout(() => {
      setRecords([
        { type: "sale", signature: "5xKj...abc1", timestamp: new Date().toISOString(), from: "Organiser", to: "Fan #1", price: 65_000_000, eventName: "Coldplay India — Mumbai" },
        { type: "listing", signature: "7yLm...def2", timestamp: new Date().toISOString(), from: "Fan #1", price: 70_000_000, eventName: "Coldplay India — Mumbai" },
        { type: "rejection", signature: "9zNp...ghi3", timestamp: new Date().toISOString(), from: "Scalper", price: 320_000_000, eventName: "Coldplay India — Mumbai" },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const typeColors = { sale: "#22c55e", resale: "#3b82f6", listing: "#f59e0b", rejection: "#ef4444" };
  const typeLabels = { sale: "Primary Sale", resale: "Resale", listing: "Listed for Resale", rejection: "Rejected (Price Too High)" };

  return (
    <div>
      <h2>Transparency Audit Trail</h2>
      <p style={{ color: "#555", maxWidth: 600 }}>Every transaction permanently recorded on Solana. No login, no wallet, no database — reads directly from the chain. Nothing here can be edited or deleted.</p>
      {loading ? <p>Loading from blockchain...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 700 }}>
          {records.map((r, i) => (
            <div key={i} style={{ border: "1px solid #eee", borderLeft: `4px solid ${typeColors[r.type]}`, borderRadius: 8, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, color: typeColors[r.type] }}>{typeLabels[r.type]}</span>
                <span style={{ fontSize: 13, color: "#888" }}>{new Date(r.timestamp).toLocaleString()}</span>
              </div>
              <p style={{ margin: "0.25rem 0 0", color: "#444" }}>{r.eventName} — {lamportsToSol(r.price)} SOL</p>
              <p style={{ margin: "0.25rem 0 0", fontSize: 12, color: "#999" }}>{r.from}{r.to ? ` → ${r.to}` : ""}</p>
              <a href={`https://explorer.solana.com/tx/${r.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#3b82f6" }}>{r.signature} ↗</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}