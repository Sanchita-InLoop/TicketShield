import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventPage from "./pages/EventPage";
import MyTickets from "./pages/MyTickets";
import ResaleMarket from "./pages/ResaleMarket";
import Transparency from "./pages/Transparency";
import WalletConnect from "./components/WalletConnect";

export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto", padding: "0 1rem" }}>
      <nav style={{ display: "flex", gap: "1.5rem", padding: "1rem 0", borderBottom: "1px solid #eee", alignItems: "center" }}>
        <Link to="/" style={{ fontWeight: 600, textDecoration: "none", color: "#000" }}>TicketShield</Link>
        <Link to="/event" style={{ textDecoration: "none", color: "#555" }}>Buy Tickets</Link>
        <Link to="/create" style={{ textDecoration: "none", color: "#555" }}>Organiser</Link>
        <Link to="/my-tickets" style={{ textDecoration: "none", color: "#555" }}>My Tickets</Link>
        <Link to="/resale" style={{ textDecoration: "none", color: "#555" }}>Resale Market</Link>
        <Link to="/transparency" style={{ textDecoration: "none", color: "#555" }}>Transparency</Link>
        <div style={{ marginLeft: "auto" }}><WalletConnect /></div>
      </nav>
      <main style={{ padding: "2rem 0" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event" element={<EventPage />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/resale" element={<ResaleMarket />} />
          <Route path="/transparency" element={<Transparency />} />
        </Routes>
      </main>
    </div>
  );
}