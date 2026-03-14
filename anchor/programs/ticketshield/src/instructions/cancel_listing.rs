use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};
use crate::state::Listing;
use crate::errors::TicketShieldError;

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(
        mut,
        constraint = seller.key() == listing.seller @ TicketShieldError::UnauthorizedCancellation
    )]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"listing", listing.ticket_mint.as_ref(), seller.key().as_ref()],
        bump = listing.bump,
        constraint = listing.is_active @ TicketShieldError::ListingNotActive,
        close = seller,
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        constraint = escrow_token_account.key() == listing.escrow_token_account,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = seller_ticket_account.owner == seller.key(),
        constraint = seller_ticket_account.mint == listing.ticket_mint,
    )]
    pub seller_ticket_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CancelListing>) -> Result<()> {
    let ticket_mint_key = ctx.accounts.listing.ticket_mint;
    let seller_key = ctx.accounts.listing.seller;
    let bump = ctx.accounts.listing.bump;

    let seeds: &[&[u8]] = &[
        b"listing",
        ticket_mint_key.as_ref(),
        seller_key.as_ref(),
        &[bump],
    ];
    let signer_seeds = &[seeds];

    // Return ticket from escrow back to seller
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.seller_ticket_account.to_account_info(),
                authority: ctx.accounts.listing.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )?;

    // Close escrow account and return rent to seller
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info(),
            destination: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.listing.to_account_info(),
        },
        signer_seeds,
    ))?;

    emit!(ListingCancelled {
        listing: ctx.accounts.listing.key(),
        seller: ctx.accounts.seller.key(),
    });

    msg!("Listing cancelled by {}", ctx.accounts.seller.key());

    Ok(())
}

#[event]
pub struct ListingCancelled {
    pub listing: Pubkey,
    pub seller: Pubkey,
}
