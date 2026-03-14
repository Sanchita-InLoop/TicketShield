import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import TicketCard from "../components/TicketCard";
import TransactionToast from "../components/TransactionToast";
import { DEMO_EVENT_NAME, DEMO_FACE_PRICE_LAMPORTS, DEMO_MAX_RESALE_BPS } from "../utils/constants";

export default function MyTickets() {
  const { publicKey } = useWallet();
  const [txStatus, setTxStatus] = useState<"success" | "error" | "pending" | null>(null);
  const [txMessage, setTxMessage] = useState("");

  const mockTickets = publicKey ? [{ ticketNumber: 4, eventName: DEMO_EVENT_NAME, owner: publicKey.toString() }] : [];

  const handleListForResale = async (ticketNumber: number) => {
    const price = prompt("Enter resale price in SOL:");
    if (!price) return;
    setTxStatus("pending");
    setTxMessage("Listing ticket...");
    // TODO Person C: wire list_ticket instruction here
    setTimeout(() => {
      setTxStatus("success");
      setTxMessage(`Ticket #${ticketNumber} listed at ${price} SOL`);
    }, 1000);
  };

  if (!publicKey) return <p>Connect your wallet to see your tickets.</p>;
  if (mockTickets.length === 0) return <p>You don't own any tickets yet. <a href="/event">Buy one →</a></p>;

  return (
    <div>
      <h2>My Tickets</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {mockTickets.map(t => (
          <TicketCard key={t.ticketNumber} eventName={t.eventName} ticketNumber={t.ticketNumber} facePrice={DEMO_FACE_PRICE_LAMPORTS} maxResaleBps={DEMO_MAX_RESALE_BPS} owner={t.owner} onListForResale={() => handleListForResale(t.ticketNumber)} />
        ))}
      </div>
      <TransactionToast status={txStatus} message={txMessage} />
    </div>
  );
}