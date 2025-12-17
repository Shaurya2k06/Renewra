use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::state::Governance;

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Governance account (will be mint authority)
    #[account(
        seeds = [Governance::SEED],
        bump = governance.bump,
    )]
    pub governance: Account<'info, Governance>,

    /// REI token mint to be created
    #[account(
        init,
        payer = authority,
        seeds = [b"reit_mint"],
        bump,
        mint::decimals = 6,
        mint::authority = governance,
    )]
    pub reit_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeMint>) -> Result<()> {
    msg!("REIT mint initialized successfully!");
    msg!("Mint: {}", ctx.accounts.reit_mint.key());
    msg!("Authority: {}", ctx.accounts.governance.key());
    Ok(())
}
