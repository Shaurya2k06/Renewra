use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::errors::RenewraError;
use crate::events::DistributeYieldEvent;
use crate::state::Governance;

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    #[account(
        constraint = authority.key() == governance.admin_key @ RenewraError::InvalidAuthority
    )]
    pub authority: Signer<'info>,

    #[account(
        seeds = [Governance::SEED],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    /// Token mint to get current supply
    pub token_mint: Account<'info, Mint>,
}

pub fn handler(ctx: Context<DistributeYield>, yield_amount: u64) -> Result<()> {
    require!(yield_amount > 0, RenewraError::InvalidAmount);
    
    let token_mint = &ctx.accounts.token_mint;
    let clock = Clock::get()?;
    
    let total_supply = token_mint.supply;
    require!(total_supply > 0, RenewraError::InvalidAmount);
    
    // Calculate per-token yield (in smallest units)
    // per_token_yield = (yield_amount * 10^6) / total_supply
    let per_token_yield = yield_amount
        .checked_mul(1_000_000)
        .ok_or(RenewraError::ArithmeticOverflow)?
        .checked_div(total_supply)
        .ok_or(RenewraError::ArithmeticOverflow)?;
    
    // Emit event (frontend will calculate individual yields)
    emit!(DistributeYieldEvent {
        total_yield_amount: yield_amount,
        per_token_yield,
        total_supply,
        timestamp: clock.unix_timestamp,
    });
    
    msg!(
        "Yield distributed: {} USDC, {} per token, supply: {}",
        yield_amount,
        per_token_yield,
        total_supply
    );
    
    Ok(())
}
