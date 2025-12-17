use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

use crate::errors::RenewraError;
use crate::events::SubscribeEvent;
use crate::state::{Governance, NavOracle};

#[derive(Accounts)]
pub struct Subscribe<'info> {
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

    /// User's USDC token account
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,

    /// Treasury USDC account
    #[account(mut)]
    pub treasury_usdc_account: Account<'info, TokenAccount>,

    /// User's Renewra token account
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    /// Renewra token mint (mint authority must be governance PDA)
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Subscribe>, usdc_amount: u64) -> Result<()> {
    require!(usdc_amount > 0, RenewraError::InvalidAmount);
    
    let governance = &ctx.accounts.governance;
    let nav_oracle = &ctx.accounts.nav_oracle;
    let clock = Clock::get()?;
    
    // Calculate mint fee
    let fee_amount = usdc_amount
        .checked_mul(governance.mint_fee_bps as u64)
        .ok_or(RenewraError::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(RenewraError::ArithmeticOverflow)?;
    
    let net_usdc = usdc_amount
        .checked_sub(fee_amount)
        .ok_or(RenewraError::ArithmeticOverflow)?;
    
    // Calculate tokens to mint: (net_usdc * 10^6) / nav_in_cents
    // NAV is stored in cents, USDC has 6 decimals, tokens have 6 decimals
    // tokens = (usdc_amount * 100) / nav_cents for proper decimal handling
    let tokens_to_mint = net_usdc
        .checked_mul(100) // Convert USDC to cents equivalent
        .ok_or(RenewraError::ArithmeticOverflow)?
        .checked_div(nav_oracle.latest_nav)
        .ok_or(RenewraError::ArithmeticOverflow)?
        .checked_mul(1_000_000) // Apply token decimals
        .ok_or(RenewraError::ArithmeticOverflow)?
        .checked_div(100) // Adjust back
        .ok_or(RenewraError::ArithmeticOverflow)?;
    
    require!(tokens_to_mint > 0, RenewraError::InvalidAmount);
    
    // Transfer USDC from user to treasury
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_usdc_account.to_account_info(),
            to: ctx.accounts.treasury_usdc_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, usdc_amount)?;
    
    // Mint Renewra tokens to user
    // Sign with governance PDA
    let seeds = &[Governance::SEED, &[governance.bump]];
    let signer_seeds = &[&seeds[..]];
    
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.governance.to_account_info(),
        },
        signer_seeds,
    );
    token::mint_to(mint_ctx, tokens_to_mint)?;
    
    // Emit event
    emit!(SubscribeEvent {
        user: ctx.accounts.user.key(),
        usdc_amount,
        tokens_minted: tokens_to_mint,
        nav_at_subscription: nav_oracle.latest_nav,
        timestamp: clock.unix_timestamp,
    });
    
    msg!(
        "User subscribed: {} USDC -> {} tokens at NAV {}",
        usdc_amount,
        tokens_to_mint,
        nav_oracle.latest_nav
    );
    
    Ok(())
}
