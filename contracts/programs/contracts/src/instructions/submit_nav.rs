use anchor_lang::prelude::*;

use crate::errors::RenewraError;
use crate::events::NavUpdateEvent;
use crate::state::{Governance, NavOracle};

#[derive(Accounts)]
pub struct SubmitNav<'info> {
    /// Oracle signer - must match governance.oracle_signer
    #[account(
        constraint = oracle_signer.key() == governance.oracle_signer @ RenewraError::OracleMismatch
    )]
    pub oracle_signer: Signer<'info>,

    /// Governance account to verify oracle signer
    #[account(
        seeds = [Governance::SEED],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    /// NAV oracle PDA to update
    #[account(
        mut,
        seeds = [NavOracle::SEED],
        bump = nav_oracle.bump
    )]
    pub nav_oracle: Account<'info, NavOracle>,
}

pub fn handler(ctx: Context<SubmitNav>, new_nav: u64) -> Result<()> {
    let nav_oracle = &mut ctx.accounts.nav_oracle;
    let clock = Clock::get()?;
    
    // Validate NAV is reasonable (non-zero)
    require!(new_nav > 0, RenewraError::InvalidNavPrice);
    
    // Step 1: Store previous NAV
    nav_oracle.previous_nav = nav_oracle.latest_nav;
    
    // Step 2: Update latest NAV
    nav_oracle.latest_nav = new_nav;
    
    // Step 3: Update timestamp
    nav_oracle.timestamp = clock.unix_timestamp;
    
    // Step 4: Emit NavUpdateEvent
    emit!(NavUpdateEvent {
        old_nav: nav_oracle.previous_nav,
        new_nav: nav_oracle.latest_nav,
        timestamp: clock.unix_timestamp,
        oracle_signer: ctx.accounts.oracle_signer.key(),
    });
    
    msg!("NAV updated: {} -> {} cents", nav_oracle.previous_nav, new_nav);
    
    Ok(())
}
