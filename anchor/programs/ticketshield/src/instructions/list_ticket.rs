use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::{Event, Listing};
use crate::errors::TicketShieldError;

#[derive(Accounts)]
pub struct ListTicket<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        seeds = [b"event", event.organizer.as_ref(), event.name.as_bytes()],
        bump = event.bump,
        constraint = event.is_active @ TicketShieldError::EventNotActive,
    )]
    pub event: Account<'info, Event>,

    #[account(
        mut,
        constraint = seller_ticket_account.owner == seller.key(),
        constraint = seller_ticket_account.mint == event.ticket_mint,
        constraint = seller_ticket_account.amount == 1,
    )]
    pub seller_ticket_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = ticket_mint,
        associated_token::authority = listing,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is the ticket mint address stored in the event
    #[account(constraint = ticket_mint.key() == event.ticket_mint)]
    pub ticket_mint: UncheckedAccount<'info>,

    #[account(
        init,
        payer = seller,
        space = Listing::LEN,
        seeds = [b"listing", event.ticket_mint.as_ref(), seller.key().as_ref()],
        bump,
    )]
    pub listing: Account<'info, Listing>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<ListTicket>, asking_price: u64) -> Result<()> {
    let event = &ctx.accounts.event;

    let max_price = event
        .max_resale_price()
        .ok_or(TicketShieldError::ArithmeticOverflow)?;

    require!(asking_price <= max_price, TicketShieldError::ResalePriceTooHigh);

    let listing = &mut ctx.accounts.listing;
    listing.seller = ctx.accounts.seller.key();
    listing.event = ctx.accounts.event.key();
    listing.ticket_mint = ctx.accounts.event.ticket_mint;
    listing.escrow_token_account = ctx.accounts.escrow_token_account.key();
    listing.asking_price = asking_price;
    listing.is_active = true;
    listing.created_at = Clock::get()?.unix_timestamp;
    listing.bump = ctx.bumps.listing;

    let cpi_accounts = Transfer {
        from: ctx.accounts.seller_ticket_account.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
        1,
    )?;

    emit!(TicketListed {
        listing: ctx.accounts.listing.key(),
        seller: ctx.accounts.seller.key(),
        event: ctx.accounts.event.key(),
        asking_price,
    });

    msg!("Ticket listed by {} for {} lamports", ctx.accounts.seller.key(), asking_price);

    Ok(())
}

#[event]
pub struct TicketListed {
    pub listing: Pubkey,
    pub seller: Pubkey,
    pub event: Pubkey,
    pub asking_price: u64,
}
