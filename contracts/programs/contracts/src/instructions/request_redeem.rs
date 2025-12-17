use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::errors::RenewraError;
use crate::events::RedeemRequestEvent;
use crate::state::{Governance, RedemptionQueue, RedemptionRequest, RedemptionStatus};

#[derive(Accounts)]
pub struct RequestRedeem<'info> {
    /// Token holder requesting redemption
    #[account(mut)]
    pub requester: Signer<'info>,

    /// Governance account to check if fund is paused
    #[account(
        seeds = [Governance::SEED],
        bump = governance.bump,
        constraint = !governance.paused @ RenewraError::FundPaused
    )]
    pub governance: Account<'info, Governance>,

    /// Redemption queue PDA storing pending requests
    #[account(
        mut,
        seeds = [RedemptionQueue::SEED],
        bump = redemption_queue.bump
    )]
    pub redemption_queue: Account<'info, RedemptionQueue>,

    /// User's REI token account (to verify balance)
    #[account(
        mut,
        constraint = user_reit_account.owner == requester.key() @ RenewraError::InvalidAuthority
    )]
    pub user_reit_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RequestRedeem>, token_amount: u64) -> Result<()> {
    // Validate token amount
    require!(token_amount > 0, RenewraError::InvalidAmount);
    
    let user_reit_account = &ctx.accounts.user_reit_account;
    let redemption_queue = &mut ctx.accounts.redemption_queue;
    let clock = Clock::get()?;
    
    // Step 1: Verify requester has sufficient REI tokens
    require!(
        user_reit_account.amount >= token_amount,
        RenewraError::InsufficientTokens
    );
    
    // Validate queue has space
    require!(
        redemption_queue.requests.len() < RedemptionQueue::MAX_REQUESTS,
        RenewraError::RedemptionQueueFull
    );
    
    // Step 2: Create RedemptionRequest struct
    let request = RedemptionRequest {
        requester: ctx.accounts.requester.key(),
        token_amount,
        requested_at: clock.unix_timestamp,
        status: RedemptionStatus::Pending,
    };
    
    // Calculate request_id before pushing (1-indexed)
    let request_id = (redemption_queue.requests.len() + 1) as u64;
    
    // Step 3: Push to redemption_queue.requests vector
    redemption_queue.requests.push(request);
    
    // Step 4: Emit RedeemRequestEvent
    emit!(RedeemRequestEvent {
        requester: ctx.accounts.requester.key(),
        token_amount,
        requested_at: clock.unix_timestamp,
        request_id,
    });
    
    msg!(
        "Redemption request #{}: {} tokens queued for settlement",
        request_id,
        token_amount
    );
    
    Ok(())
}
