use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use crate::state::Event;
use crate::errors::TicketShieldError;

#[derive(Accounts)]
pub struct PurchaseTicket<'info> {
    #[account(
        mut,
        seeds = [b"event", event.organizer.as_ref(), event.name.as_bytes()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,

    #[account(
        mut,
        seeds = [b"ticket_mint", event.key().as_ref()],
        bump,
    )]
    pub ticket_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = ticket_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_ticket_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Verified against event.organizer in handler
    #[account(mut)]
    pub organizer: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<PurchaseTicket>) -> Result<()> {
    // ✅ Capture key and account_info BEFORE taking the mutable borrow of event.
    //    Both are needed later while `event` (&mut) is still in scope.
    let event_key = ctx.accounts.event.key();
    let event_account_info = ctx.accounts.event.to_account_info();

    let event = &mut ctx.accounts.event;

    require!(event.is_active, TicketShieldError::EventNotActive);
    require!(
        event.tickets_sold < event.total_supply,
        TicketShieldError::EventSoldOut
    );
    require_keys_eq!(
        ctx.accounts.organizer.key(),
        event.organizer,
        TicketShieldError::EventNotActive
    );

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.organizer.to_account_info(),
            },
        ),
        event.face_price,
    )?;

    let organizer_key = event.organizer;
    let name_bytes = event.name.as_bytes().to_vec();
    let bump = event.bump;

    let seeds: &[&[u8]] = &[
        b"event",
        organizer_key.as_ref(),
        name_bytes.as_slice(),
        &[bump],
    ];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.ticket_mint.to_account_info(),
                to: ctx.accounts.buyer_ticket_account.to_account_info(),
                authority: event_account_info, // ✅ use pre-captured AccountInfo
            },
            &[seeds],
        ),
        1,
    )?;

    event.tickets_sold = event
        .tickets_sold
        .checked_add(1)
        .ok_or(TicketShieldError::ArithmeticOverflow)?;

    let ticket_number = event.tickets_sold;
    let price = event.face_price;

    emit!(TicketPurchased {
        event: event_key,   // ✅ use pre-captured key
        buyer: ctx.accounts.buyer.key(),
        price_paid: price,
        ticket_number,
    });

    msg!("Ticket #{} sold to {} for {} lamports", ticket_number, ctx.accounts.buyer.key(), price);

    Ok(())
}

#[event]
pub struct TicketPurchased {
    pub event: Pubkey,
    pub buyer: Pubkey,
    pub price_paid: u64,
    pub ticket_number: u32,
}
