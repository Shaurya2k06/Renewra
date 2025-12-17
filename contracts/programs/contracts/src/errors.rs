use anchor_lang::prelude::*;

#[error_code]
pub enum RenewraError {
    /// NAV price is zero or invalid
    #[msg("NAV price is zero or invalid")]
    InvalidNavPrice = 6000,

    /// Signer is not the authorized oracle
    #[msg("Signer is not the authorized oracle")]
    OracleMismatch = 6001,

    /// Amount must be greater than zero
    #[msg("Amount must be greater than zero")]
    InvalidAmount = 6002,

    /// User does not have enough tokens to redeem
    #[msg("User does not have enough tokens to redeem")]
    InsufficientTokens = 6003,

    /// Calculation overflow (NAV * amount too large)
    #[msg("Calculation overflow (NAV * amount too large)")]
    ArithmeticOverflow = 6004,

    /// Fund is paused; cannot subscribe or redeem
    #[msg("Fund is paused; cannot subscribe or redeem")]
    FundPaused = 6005,

    /// Signer is not authorized (admin key required)
    #[msg("Signer is not authorized (admin key required)")]
    InvalidAuthority = 6006,

    /// Redemption queue has reached max capacity
    #[msg("Redemption queue has reached max capacity")]
    RedemptionQueueFull = 6007,
}
