use anchor_lang::prelude::*;

#[account]
pub struct Event {
    /// Wallet that created this event — receives primary sale payments
    pub organizer: Pubkey,       // 32 bytes

    /// The SPL token mint for this event's tickets
    pub ticket_mint: Pubkey,     // 32 bytes

    /// Human readable event name stored on-chain for transparency
    pub name: String,            // 4 + 50 bytes

    /// Price per ticket in lamports (1 SOL = 1,000,000,000 lamports)
    pub face_price: u64,         // 8 bytes

    /// Maximum resale price in basis points of face_price
    /// 10000 = 100% (no markup), 11000 = 110% (10% max markup)
    pub max_resale_bps: u16,     // 2 bytes

    /// Total number of tickets available
    pub total_supply: u32,       // 4 bytes

    /// Number of tickets sold — increments on every purchase
    pub tickets_sold: u32,       // 4 bytes

    /// Organiser can pause sales without deleting the event
    pub is_active: bool,         // 1 byte

    /// PDA bump seed — stored so program can sign CPIs
    pub bump: u8,                // 1 byte
}

impl Event {
    pub const LEN: usize = 8    // discriminator
        + 32                    // organizer
        + 32                    // ticket_mint
        + 4 + 50                // name (length prefix + max chars)
        + 8                     // face_price
        + 2                     // max_resale_bps
        + 4                     // total_supply
        + 4                     // tickets_sold
        + 1                     // is_active
        + 1;                    // bump

    pub fn max_resale_price(&self) -> Option<u64> {
        (self.face_price as u128)
            .checked_mul(self.max_resale_bps as u128)?
            .checked_div(10000)?
            .try_into()
            .ok()
    }
}
