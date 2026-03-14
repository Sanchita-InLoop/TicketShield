use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Event, Listing};
use crate::errors::TicketShieldError;

// =============================================================================
// PERSON B — implement this file
// THIS IS THE MOST IMPORTANT FUNCTION IN THE ENTIRE PROJECT.
//
// What this instruction must do:
//   1. Load listing.asking_price
//   2. Load event.face_price and event.max_resale_bps
//   3. Compute max_allowed = face_price * max_resale_bps / 10000
//   4. THE ENFORCEMENT CHECK (must be first):
//        require!(
//            listing.asking_price <= max_allowed,
//            TicketShieldError::ResalePriceTooHigh
//        );
//   5. Validate buyer != seller
//   6. Transfer SOL: buyer -> seller
//   7. Transfer ticket token: escrow -> buyer (listing PDA signs as authority)
//   8. Set listing.is_active = false
//   9. Emit TicketResold event
// =============================================================================

#[derive(Accounts)]
pub struct BuyListedTicket<'info> {
    #[account(
        seeds = [b"event", event.organizer.as_ref(), event.name.as_bytes()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub listing: Account<'info, Listing>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_ticket_account: Account<'info, TokenAccount>,

    /// CHECK: verified as listing.seller in handler
    #[account(mut)]
    pub seller: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<BuyListedTicket>) -> Result<()> {
    // TODO Person B: THE require!() CHECK MUST BE THE VERY FIRST THING HERE
    let _ = ctx;
    err!(TicketShieldError::EventNotActive)
}

#[event]
pub struct TicketResold {
    pub listing: Pubkey,
    pub event: Pubkey,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub resale_price: u64,
    pub face_price: u64,
}

#[event]
pub struct ResaleRejected {
    pub listing: Pubkey,
    pub event: Pubkey,
    pub attempted_price: u64,
    pub max_allowed_price: u64,
}