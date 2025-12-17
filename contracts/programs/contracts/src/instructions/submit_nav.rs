use anchor_lang::prelude::*;

use crate::errors::RenewraError;
use crate::events::NavUpdateEvent;
use crate::state::NavOracle;

#[derive(Accounts)]
pub struct SubmitNav<'info> {
    #[account(
        constraint = oracle_authority.key() == nav_oracle.oracle_signer @ RenewraError::OracleMismatch
    )]
    pub oracle_authority: Signer<'info>,

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
    
    // Store previous NAV
    nav_oracle.previous_nav = nav_oracle.latest_nav;
    
    // Update to new NAV
    nav_oracle.latest_nav = new_nav;
    nav_oracle.timestamp = clock.unix_timestamp;
    
    // Emit event
    emit!(NavUpdateEvent {
        old_nav: nav_oracle.previous_nav,
        new_nav: nav_oracle.latest_nav,
        total_supply: 0, // TODO: Pass actual supply
        timestamp: clock.unix_timestamp,
    });
    
    msg!("NAV updated: {} -> {} cents", nav_oracle.previous_nav, new_nav);
    
    Ok(())
}
