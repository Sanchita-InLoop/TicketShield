interface TransactionToastProps {
  status: "success" | "error" | "pending" | null;
  message: string;
  txSignature?: string;
}

export default function TransactionToast({ status, message, txSignature }: TransactionToastProps) {
  if (!status) return null;
  const colors = { success: "#22c55e", error: "#ef4444", pending: "#f59e0b" };
  return (
    <div style={{ position: "fixed", bottom: "2rem", right: "2rem", background: "#fff", border: `2px solid ${colors[status]}`, borderRadius: 8, padding: "1rem 1.5rem", maxWidth: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 1000 }}>
      <p style={{ margin: 0, fontWeight: 500, color: colors[status] }}>
        {status === "success" ? "✓" : status === "error" ? "✗" : "⏳"} {message}
      </p>
      {txSignature && (
        <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#666", wordBreak: "break-all" }}>
          View on Explorer →
        </a>
      )}
    </div>
  );
}