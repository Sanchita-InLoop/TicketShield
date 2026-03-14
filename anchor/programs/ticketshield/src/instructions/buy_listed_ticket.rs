use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::{Event, Listing};
use crate::errors::TicketShieldError;

#[derive(Accounts)]
pub struct BuyListedTicket<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Verified via listing.seller constraint
    #[account(
        mut,
        constraint = seller.key() == listing.seller @ TicketShieldError::UnauthorizedCancellation
    )]
    pub seller: UncheckedAccount<'info>,

    #[account(
        seeds = [b"event", event.organizer.as_ref(), event.name.as_bytes()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,

    #[account(
        mut,
        seeds = [b"listing", listing.ticket_mint.as_ref(), listing.seller.as_ref()],
        bump = listing.bump,
        constraint = listing.is_active @ TicketShieldError::ListingNotActive,
        constraint = listing.event == event.key(),
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        constraint = escrow_token_account.key() == listing.escrow_token_account,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = ticket_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_ticket_account: Account<'info, TokenAccount>,

    /// CHECK: Verified via listing.ticket_mint
    #[account(constraint = ticket_mint.key() == listing.ticket_mint)]
    pub ticket_mint: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<BuyListedTicket>) -> Result<()> {
    let ticket_mint_key = ctx.accounts.listing.ticket_mint;
    let seller_key = ctx.accounts.listing.seller;
    let bump = ctx.accounts.listing.bump;
    let asking_price = ctx.accounts.listing.asking_price;

    require!(
        ctx.accounts.buyer.key() != seller_key,
        TicketShieldError::CannotBuyOwnListing
    );

    // THE KEY CHECK — this single line makes scalping impossible
    let max_price = ctx.accounts.event
        .max_resale_price()
        .ok_or(TicketShieldError::ArithmeticOverflow)?;

    require!(asking_price <= max_price, TicketShieldError::ResalePriceTooHigh);

    // Transfer SOL from buyer to seller
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.seller.to_account_info(),
            },
        ),
        asking_price,
    )?;

    // Transfer ticket from escrow to buyer
    let seeds: &[&[u8]] = &[
        b"listing",
        ticket_mint_key.as_ref(),
        seller_key.as_ref(),
        &[bump],
    ];
    let signer_seeds = &[seeds];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.buyer_ticket_account.to_account_info(),
                authority: ctx.accounts.listing.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )?;

    // Mark listing closed — stays on-chain as permanent audit record
    let listing = &mut ctx.accounts.listing;
    listing.is_active = false;

    emit!(TicketResold {
        listing: ctx.accounts.listing.key(),
        buyer: ctx.accounts.buyer.key(),
        seller: seller_key,
        event: ctx.accounts.event.key(),
        price_paid: asking_price,
    });

    msg!(
        "Ticket resold: {} bought from {} for {} lamports",
        ctx.accounts.buyer.key(),
        seller_key,
        asking_price,
    );

    Ok(())
}

#[event]
pub struct TicketResold {
    pub listing: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub event: Pubkey,
    pub price_paid: u64,
}
