use anchor_lang::prelude::*;

use crate::state::{Governance, NavOracle, RedemptionQueue};

#[derive(Accounts)]
pub struct InitializeFund<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Governance::SPACE,
        seeds = [Governance::SEED],
        bump
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        init,
        payer = authority,
        space = NavOracle::SPACE,
        seeds = [NavOracle::SEED],
        bump
    )]
    pub nav_oracle: Account<'info, NavOracle>,

    #[account(
        init,
        payer = authority,
        space = RedemptionQueue::SPACE,
        seeds = [RedemptionQueue::SEED],
        bump
    )]
    pub redemption_queue: Account<'info, RedemptionQueue>,

    pub system_program: Program<'info, System>,
}

/// Parameters for initializing the fund
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeFundParams {
    pub oracle_signer: Pubkey,
    pub management_fee_bps: u16,
    pub mint_fee_bps: u16,
    pub redemption_fee_bps: u16,
    pub initial_nav: u64,
}

pub fn handler(ctx: Context<InitializeFund>, params: InitializeFundParams) -> Result<()> {
    msg!("Initializing Renewra fund...");
    
    // Initialize Governance
    let governance = &mut ctx.accounts.governance;
    governance.admin_key = ctx.accounts.authority.key();
    governance.oracle_signer = params.oracle_signer;
    governance.management_fee_bps = params.management_fee_bps;
    governance.mint_fee_bps = params.mint_fee_bps;
    governance.redemption_fee_bps = params.redemption_fee_bps;
    governance.paused = false;
    governance.bump = ctx.bumps.governance;

    // Initialize NavOracle
    let nav_oracle = &mut ctx.accounts.nav_oracle;
    nav_oracle.latest_nav = params.initial_nav;
    nav_oracle.previous_nav = params.initial_nav;
    nav_oracle.timestamp = Clock::get()?.unix_timestamp;
    nav_oracle.bump = ctx.bumps.nav_oracle;

    // Initialize RedemptionQueue
    let redemption_queue = &mut ctx.accounts.redemption_queue;
    redemption_queue.requests = Vec::new();
    redemption_queue.bump = ctx.bumps.redemption_queue;

    msg!("Renewra fund initialized successfully!");
    Ok(())
}
