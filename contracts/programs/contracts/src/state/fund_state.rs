use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct FundState {
    /// Authority that can manage the fund (admin)
    pub authority: Pubkey,
    
    /// The SPL token mint for Renewra tokens
    pub token_mint: Pubkey,
    
    /// Treasury PDA that holds USDC
    pub treasury: Pubkey,
    
    /// USDC mint address
    pub usdc_mint: Pubkey,
    
    /// Oracle authority that can update NAV
    pub oracle_authority: Pubkey,
    
    /// Management fee in basis points (e.g., 50 = 0.5%)
    pub management_fee_bps: u16,
    
    /// Mint fee in basis points (e.g., 25 = 0.25%)
    pub mint_fee_bps: u16,
    
    /// Redemption fee in basis points (e.g., 25 = 0.25%)
    pub redemption_fee_bps: u16,
    
    /// Whether the fund is paused
    pub paused: bool,
    
    /// Total USDC deposited into the fund
    pub total_deposits: u64,
    
    /// Total yield distributed
    pub total_yield_distributed: u64,
    
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl FundState {
    pub const SEED: &'static [u8] = b"fund_state";
}
