use anchor_lang::prelude::*;

/// NavOracle PDA stores the latest NAV (Net Asset Value) per token.
/// Updated hourly by the oracle service.
#[account]
#[derive(InitSpace)]
pub struct NavOracle {
    /// Current NAV per token in cents (e.g., 967 = $9.67)
    pub latest_nav: u64,
    
    /// Previous NAV for comparison and change tracking
    pub previous_nav: u64,
    
    /// Unix timestamp of last NAV update
    pub timestamp: i64,
    
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl NavOracle {
    /// PDA seed for nav_oracle account
    pub const SEED: &'static [u8] = b"nav_oracle";
    
    /// Space: 8 (discriminator) + 8 + 8 + 8 + 1 = 33 bytes
    pub const SPACE: usize = 8 + 8 + 8 + 8 + 1;
}
