use anchor_lang::prelude::*;

#[error_code]
pub enum TicketShieldError {
    // --- Resale enforcement (the core of the product) ---
    #[msg("Resale price exceeds the maximum allowed for this event")]
    ResalePriceTooHigh,

    // --- Event state ---
    #[msg("This event is no longer active")]
    EventNotActive,

    #[msg("This event is sold out")]
    EventSoldOut,

    #[msg("Event name cannot be empty")]
    EventNameEmpty,

    #[msg("Event name is too long (max 50 characters)")]
    EventNameTooLong,

    #[msg("Ticket supply must be at least 1")]
    InvalidSupply,

    #[msg("Face price must be greater than zero")]
    InvalidFacePrice,

    #[msg("Resale cap must be between 10000 (100%) and 50000 (500%) basis points")]
    InvalidResaleBps,

    // --- Listing ---
    #[msg("This listing is no longer active")]
    ListingNotActive,

    #[msg("You cannot buy your own listing")]
    CannotBuyOwnListing,

    #[msg("Only the seller can cancel this listing")]
    UnauthorizedCancellation,

    // --- Arithmetic safety ---
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,
}