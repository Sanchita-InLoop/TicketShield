import { Link } from "react-router-dom";
export default function Home() {
  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>Ticket scalping is impossible here.</h1>
      <p style={{ fontSize: "1.2rem", color: "#555", lineHeight: 1.7 }}>
        In January 2025, Coldplay tickets worth ₹6,500 sold on secondary markets for ₹32,000.
        BookMyShow's terms of service said scalping was prohibited. Scalpers didn't care.
      </p>
      <p style={{ fontSize: "1.2rem", color: "#555", lineHeight: 1.7 }}>
        TicketShield enforces the resale cap in the smart contract — not in a policy document.
        The ticket <strong>mathematically cannot</strong> change hands above the set price.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <Link to="/event"><button style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", cursor: "pointer", background: "#000", color: "#fff", border: "none", borderRadius: 8 }}>Buy a Ticket</button></Link>
        <Link to="/transparency"><button style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", cursor: "pointer", background: "transparent", border: "1px solid #000", borderRadius: 8 }}>View Audit Trail</button></Link>
      </div>
      <div style={{ marginTop: "3rem", padding: "1.5rem", background: "#f9f9f9", borderRadius: 12 }}>
        <h3 style={{ margin: "0 0 1rem" }}>How it works</h3>
        <ol style={{ lineHeight: 2, color: "#444" }}>
          <li>Organiser creates event — sets face price and resale cap</li>
          <li>Fan buys ticket — receives an NFT in their Phantom wallet</li>
          <li>Fan wants to resell — lists on our marketplace</li>
          <li>Scalper tries to list at 5x — <strong style={{ color: "#e55" }}>rejected by the contract</strong></li>
          <li>Every transaction is publicly verifiable — no trust required</li>
        </ol>
      </div>
    </div>
  );
}