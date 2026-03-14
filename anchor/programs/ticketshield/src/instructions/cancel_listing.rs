use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Event, Listing};
use crate::errors::TicketShieldError;

// =============================================================================
// PERSON B — implement this file
//
// What this instruction must do:
//   1. Validate seller.key() == listing.seller
//   2. Validate listing.is_active == true
//   3. Transfer ticket token: escrow -> seller wallet
//   4. Set listing.is_active = false
//   5. Emit ListingCancelled event
// =============================================================================

#[derive(Accounts)]
pub struct CancelListing<'info> {
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
    pub seller_ticket_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CancelListing>) -> Result<()> {
    // TODO Person B: implement cancellation logic
    let _ = ctx;
    err!(TicketShieldError::UnauthorizedCancellation)
}

#[event]
pub struct ListingCancelled {
    pub listing: Pubkey,
    pub event: Pubkey,
    pub seller: Pubkey,
}