use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::errors::RenewraError;
use crate::events::RedeemRequestEvent;
use crate::state::{Governance, NavOracle, RedemptionQueue, RedemptionRequest, RedemptionStatus};

#[derive(Accounts)]
pub struct RequestRedeem<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [Governance::SEED],
        bump = governance.bump,
        constraint = !governance.paused @ RenewraError::FundPaused
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        seeds = [NavOracle::SEED],
        bump = nav_oracle.bump
    )]
    pub nav_oracle: Account<'info, NavOracle>,

    #[account(
        mut,
        seeds = [RedemptionQueue::SEED],
        bump = redemption_queue.bump
    )]
    pub redemption_queue: Account<'info, RedemptionQueue>,

    /// User's Renewra token account (to verify balance)
    #[account(
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
}

pub fn handler(ctx: Context<RequestRedeem>, token_amount: u64) -> Result<()> {
    require!(token_amount > 0, RenewraError::InvalidAmount);
    
    let user_token_account = &ctx.accounts.user_token_account;
    let redemption_queue = &mut ctx.accounts.redemption_queue;
    let nav_oracle = &ctx.accounts.nav_oracle;
    let clock = Clock::get()?;
    
    // Verify user has enough tokens
    require!(
        user_token_account.amount >= token_amount,
        RenewraError::InsufficientTokens
    );
    
    // Check queue capacity
    require!(
        redemption_queue.requests.len() < RedemptionQueue::MAX_REQUESTS,
        RenewraError::RedemptionQueueFull
    );
    
    // Create redemption request
    let request = RedemptionRequest {
        requester: ctx.accounts.user.key(),
        token_amount,
        requested_at: clock.unix_timestamp,
        status: RedemptionStatus::Pending,
    };
    
    // Add to queue
    redemption_queue.requests.push(request);
    
    // Emit event
    emit!(RedeemRequestEvent {
        user: ctx.accounts.user.key(),
        token_amount,
        nav_at_request: nav_oracle.latest_nav,
        request_id: redemption_queue.requests.len() as u64,
        timestamp: clock.unix_timestamp,
    });
    
    msg!(
        "Redemption requested: {} tokens at NAV {}",
        token_amount,
        nav_oracle.latest_nav
    );
    
    Ok(())
}
