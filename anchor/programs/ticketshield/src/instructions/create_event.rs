use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use crate::state::Event;
use crate::errors::TicketShieldError;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = organizer,
        space = Event::LEN,
        seeds = [b"event", organizer.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,

    #[account(
        init,
        payer = organizer,
        mint::decimals = 0,
        mint::authority = event,
        mint::freeze_authority = event,
        seeds = [b"ticket_mint", event.key().as_ref()],
        bump
    )]
    pub ticket_mint: Account<'info, Mint>,

    #[account(mut)]
    pub organizer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreateEvent>,
    name: String,
    total_supply: u32,
    face_price: u64,
    max_resale_bps: u16,
) -> Result<()> {
    require!(!name.is_empty(), TicketShieldError::EventNameEmpty);
    require!(name.len() <= 50, TicketShieldError::EventNameTooLong);
    require!(total_supply > 0, TicketShieldError::InvalidSupply);
    require!(face_price > 0, TicketShieldError::InvalidFacePrice);
    require!(
        max_resale_bps >= 10000 && max_resale_bps <= 50000,
        TicketShieldError::InvalidResaleBps
    );

    let event = &mut ctx.accounts.event;
    let bump = ctx.bumps.event;

    event.organizer = ctx.accounts.organizer.key();
    event.ticket_mint = ctx.accounts.ticket_mint.key();
    event.name = name;
    event.face_price = face_price;
    event.max_resale_bps = max_resale_bps;
    event.total_supply = total_supply;
    event.tickets_sold = 0;
    event.is_active = true;
    event.bump = bump;

    emit!(EventCreated {
        event: ctx.accounts.event.key(),
        organizer: ctx.accounts.organizer.key(),
        name: event.name.clone(),
        total_supply,
        face_price,
        max_resale_bps,
    });

    msg!(
        "Event created: {} | Supply: {} | Face: {} lamports | Max resale: {}bps",
        event.name, event.total_supply, event.face_price, event.max_resale_bps
    );

    Ok(())
}

#[event]
pub struct EventCreated {
    pub event: Pubkey,
    pub organizer: Pubkey,
    pub name: String,
    pub total_supply: u32,
    pub face_price: u64,
    pub max_resale_bps: u16,
}