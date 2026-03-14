interface TicketCardProps {
  eventName: string;
  ticketNumber: number;
  facePrice: number;
  maxResaleBps: number;
  owner: string;
  onListForResale?: () => void;
}

export default function TicketCard({ eventName, ticketNumber, facePrice, maxResaleBps, owner, onListForResale }: TicketCardProps) {
  const maxResalePrice = (facePrice * maxResaleBps) / 10000;
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: "1.5rem", maxWidth: 320 }}>
      <h3 style={{ margin: "0 0 0.5rem" }}>{eventName}</h3>
      <p style={{ color: "#666", margin: "0.25rem 0" }}>Ticket #{ticketNumber}</p>
      <p style={{ margin: "0.25rem 0" }}>Face price: {facePrice / 1e9} SOL</p>
      <p style={{ margin: "0.25rem 0", color: "#e55" }}>Max resale: {maxResalePrice / 1e9} SOL</p>
      <p style={{ margin: "0.5rem 0", fontSize: 12, color: "#999", wordBreak: "break-all" }}>Owner: {owner.slice(0, 8)}...</p>
      {onListForResale && (
        <button onClick={onListForResale} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
          List for Resale
        </button>
      )}
    </div>
  );
}