use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

// Replace with real program ID after running:
//   anchor build
//   solana-keygen pubkey target/deploy/ticketshield-keypair.json
declare_id!("Ft9ag3LtV2PWM5vADsyj9sEfthoWYKgwLiX3XxZtKoPX");

#[program]
pub mod ticketshield {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        name: String,
        total_supply: u32,
        face_price: u64,
        max_resale_bps: u16,
    ) -> Result<()> {
        instructions::create_event::handler(ctx, name, total_supply, face_price, max_resale_bps)
    }

    pub fn purchase_ticket(ctx: Context<PurchaseTicket>) -> Result<()> {
        instructions::purchase_ticket::handler(ctx)
    }

    pub fn list_ticket(ctx: Context<ListTicket>, asking_price: u64) -> Result<()> {
        instructions::list_ticket::handler(ctx, asking_price)
    }

    pub fn buy_listed_ticket(ctx: Context<BuyListedTicket>) -> Result<()> {
        instructions::buy_listed_ticket::handler(ctx)
    }

    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        instructions::cancel_listing::handler(ctx)
    }
}