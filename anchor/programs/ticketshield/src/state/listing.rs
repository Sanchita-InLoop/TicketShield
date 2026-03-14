use anchor_lang::prelude::*;

#[account]
pub struct Listing {
    /// Wallet that listed the ticket for sale
    pub seller: Pubkey,                // 32 bytes

    /// The event this ticket belongs to
    pub event: Pubkey,                 // 32 bytes

    /// The mint address of the specific ticket token
    pub ticket_mint: Pubkey,           // 32 bytes

    /// PDA escrow account holding the ticket token during listing
    /// No private key exists — only the program can release it
    pub escrow_token_account: Pubkey,  // 32 bytes

    /// Price the seller is asking in lamports
    pub asking_price: u64,             // 8 bytes

    /// True while active. Set to false after sale or cancellation.
    pub is_active: bool,               // 1 byte

    /// Unix timestamp when listed — shown on transparency page
    pub created_at: i64,               // 8 bytes

    /// PDA bump seed
    pub bump: u8,                      // 1 byte
}

impl Listing {
    pub const LEN: usize = 8           // discriminator
        + 32                           // seller
        + 32                           // event
        + 32                           // ticket_mint
        + 32                           // escrow_token_account
        + 8                            // asking_price
        + 1                            // is_active
        + 8                            // created_at
        + 1;                           // bump
}