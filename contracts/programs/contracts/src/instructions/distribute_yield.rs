use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::RenewraError;
use crate::events::DistributeYieldEvent;
use crate::state::Governance;

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    /// Fund administrator - must match governance.admin_key
    #[account(
        mut,
        constraint = fund_authority.key() == governance.admin_key @ RenewraError::InvalidAuthority
    )]
    pub fund_authority: Signer<'info>,

    /// Governance account to verify authority
    #[account(
        seeds = [Governance::SEED],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    /// Treasury PDA token account holding USDC (for balance verification)
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,

    /// REI token mint to read total supply
    pub reit_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<DistributeYield>, yield_amount: u64) -> Result<()> {
    // Validate yield amount
    require!(yield_amount > 0, RenewraError::InvalidAmount);
    
    let treasury = &ctx.accounts.treasury;
    let reit_mint = &ctx.accounts.reit_mint;
    
    // Defensive check: treasury has sufficient USDC
    require!(
        treasury.amount >= yield_amount,
        RenewraError::InsufficientTokens
    );
    
    // Step 1: Read total REI token supply
    let total_supply = reit_mint.supply;
    require!(total_supply > 0, RenewraError::InvalidAmount);
    
    // Step 2: Calculate per-token yield using u128 for precision
    // Formula: per_token = (yield_amount * 10^6) / total_supply
    // This gives yield in micro-units per token
    let per_token_yield = (yield_amount as u128)
        .checked_mul(1_000_000)
        .ok_or(RenewraError::ArithmeticOverflow)?
        .checked_div(total_supply as u128)
        .ok_or(RenewraError::ArithmeticOverflow)?;
    
    // Step 3: For MVP hackathon - emit event only, no transfers
    // In production, would iterate through holder accounts and transfer
    // Frontend/oracle engine uses this event to verify distribution
    emit!(DistributeYieldEvent {
        yield_amount,
        total_token_supply: total_supply,
        per_token_yield,
    });
    
    msg!(
        "Yield distribution recorded: {} USDC across {} tokens ({} per token)",
        yield_amount,
        total_supply,
        per_token_yield
    );
    
    Ok(())
}
