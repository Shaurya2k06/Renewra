use anchor_lang::prelude::*;

/// Governance account stores fund-wide parameters and admin keys.
/// Initialized once during fund setup.
#[account]
#[derive(InitSpace)]
pub struct Governance {
    /// Admin public key that can update fund parameters
    pub admin_key: Pubkey,
    
    /// Oracle signer public key authorized to submit NAV updates
    pub oracle_signer: Pubkey,
    
    /// Management fee in basis points (e.g., 50 = 0.5%)
    pub management_fee_bps: u16,
    
    /// Mint fee in basis points (e.g., 25 = 0.25%)
    pub mint_fee_bps: u16,
    
    /// Redemption fee in basis points (e.g., 25 = 0.25%)
    pub redemption_fee_bps: u16,
    
    /// Whether the fund is paused (emergency stop)
    pub paused: bool,
    
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl Governance {
    /// PDA seed for governance account
    pub const SEED: &'static [u8] = b"governance";
    
    /// Space: 8 (discriminator) + 32 + 32 + 2 + 2 + 2 + 1 + 1 = 80 bytes
    pub const SPACE: usize = 8 + 32 + 32 + 2 + 2 + 2 + 1 + 1;
}
