use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::state::{Event, Listing};
use crate::errors::TicketShieldError;

// =============================================================================
// PERSON B — implement this file
//
// What this instruction must do:
//   1. Validate seller owns at least 1 ticket token for this event
//   2. Validate asking_price > 0
//   3. Create a Listing account (PDA) with seller, event, asking_price etc.
//   4. Transfer ticket token from seller wallet into escrow_token_account PDA
//   5. Set listing.is_active = true
//   6. Emit a TicketListed event
//
// PDA seeds for listing:  ["listing", seller_pubkey, ticket_mint_pubkey]
// PDA seeds for escrow:   ["escrow",  listing_pubkey]
// =============================================================================

#[derive(Accounts)]
pub struct ListTicket<'info> {
    #[account(
        seeds = [b"event", event.organizer.as_ref(), event.name.as_bytes()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,

    #[account(
        init,
        payer = seller,
        space = Listing::LEN,
        seeds = [b"listing", seller.key().as_ref(), ticket_mint.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(seeds = [b"ticket_mint", event.key().as_ref()], bump)]
    pub ticket_mint: Account<'info, Mint>,

    #[account(mut)]
    pub seller_ticket_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<ListTicket>, asking_price: u64) -> Result<()> {
    // TODO Person B: implement full listing logic
    let _ = (ctx, asking_price);
    err!(TicketShieldError::EventNotActive)
}

#[event]
pub struct TicketListed {
    pub listing: Pubkey,
    pub event: Pubkey,
    pub seller: Pubkey,
    pub asking_price: u64,
    pub created_at: i64,
}