# TicketShield — Anti-Scalping Ticket Protocol on Solana

> The resale cap is enforced by the smart contract, not a policy document.
> The code doesn't take bribes.

## Team Division

| Person | Owns |
|--------|------|
| A | errors.rs, state/, create_event.rs, purchase_ticket.rs, lib.rs, integration |
| B | list_ticket.rs, buy_listed_ticket.rs (★ enforcement), cancel_listing.rs, tests |
| C | hooks/, components/, CreateEvent.tsx, EventPage.tsx, MyTickets.tsx |
| D | Home.tsx, ResaleMarket.tsx, Transparency.tsx, pitch deck, demo script |

## Quick Start

### Prerequisites

- Rust: <https://rustup.rs>
- Solana CLI: <https://docs.solana.com/cli/install-solana-cli-tools>
- Anchor: cargo install --git <https://github.com/coral-xyz/anchor> avm --locked && avm install 0.29.0
- Node + Yarn: <https://nodejs.org>

### Person A First Steps

```
cd anchor
anchor build
solana-keygen pubkey target/deploy/ticketshield-keypair.json
# Replace 11111111111111111111111111111111 with real ID in:
#   programs/ticketshield/src/lib.rs
#   Anchor.toml
#   ../frontend/src/utils/constants.ts
anchor build
cp target/idl/ticketshield.json ../frontend/src/idl/ticketshield.json
solana airdrop 2 --url devnet
anchor deploy --provider.cluster devnet
```

### Frontend

```
cd frontend
yarn install
yarn dev
```

