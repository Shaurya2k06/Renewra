use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

use crate::errors::RenewraError;
use crate::events::SubscribeEvent;
use crate::state::{Governance, NavOracle};

#[derive(Accounts)]
pub struct Subscribe<'info> {
    /// Investor signing the transaction
    #[account(mut)]
    pub user: Signer<'info>,

    /// Governance account for fee params and pause check
    #[account(
        seeds = [Governance::SEED],
        bump = governance.bump,
        constraint = !governance.paused @ RenewraError::FundPaused
    )]
    pub governance: Account<'info, Governance>,

    /// NAV oracle for current price
    #[account(
        seeds = [NavOracle::SEED],
        bump = nav_oracle.bump,
        constraint = nav_oracle.latest_nav > 0 @ RenewraError::InvalidNavPrice
    )]
    pub nav_oracle: Account<'info, NavOracle>,

    /// User's USDC token account (source of funds)
    #[account(
        mut,
        constraint = user_usdc_account.owner == user.key() @ RenewraError::InvalidAuthority
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,

    /// Treasury PDA token account (receives USDC)
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,

    /// User's REI token account (receives minted tokens)
    #[account(
        mut,
        constraint = user_reit_account.owner == user.key() @ RenewraError::InvalidAuthority
    )]
    pub user_reit_account: Account<'info, TokenAccount>,

    /// REI token mint (mint authority = governance PDA)
    #[account(mut)]
    pub reit_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Subscribe>, usdc_amount: u64) -> Result<()> {
    // Validate amount
    require!(usdc_amount > 0, RenewraError::InvalidAmount);
    
    let governance = &ctx.accounts.governance;
    let nav_oracle = &ctx.accounts.nav_oracle;
    
    // Step 1: Read current NAV (in cents, e.g., 1000 = $10.00)
    let nav_cents = nav_oracle.latest_nav;
    
    // Step 2: Calculate mint fee: fee = usdc_amount * mint_fee_bps / 10000
    let fee_amount = (usdc_amount as u128)
        .checked_mul(governance.mint_fee_bps as u128)
        .ok_or(RenewraError::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(RenewraError::ArithmeticOverflow)? as u64;
    
    // Step 3: Calculate net USDC after fee
    let net_usdc = usdc_amount
        .checked_sub(fee_amount)
        .ok_or(RenewraError::ArithmeticOverflow)?;
    
    // Step 4: Calculate tokens to mint using u128 for precision
    // Formula: tokens = (net_usdc * 10^6) / nav_cents * 100
    // net_usdc is in USDC smallest units (6 decimals), nav is in cents
    // Result is in token smallest units (6 decimals)
    // 
    // Example: 100 USDC (100_000_000 smallest), NAV = 1000 cents ($10)
    // tokens = (100_000_000 * 100) / 1000 = 10_000_000 (10 tokens with 6 decimals)
    let tokens_to_mint = (net_usdc as u128)
        .checked_mul(100) // Convert to cents precision
        .ok_or(RenewraError::ArithmeticOverflow)?
        .checked_div(nav_cents as u128)
        .ok_or(RenewraError::ArithmeticOverflow)? as u64;
    
    require!(tokens_to_mint > 0, RenewraError::InvalidAmount);
    
    // Step 5: Transfer full usdc_amount from user to treasury
    // (fee stays in treasury as part of fund balance)
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_usdc_account.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, usdc_amount)?;
    
    // Step 6: Mint REI tokens to user using governance PDA as signer
    let seeds = &[Governance::SEED, &[governance.bump]];
    let signer_seeds = &[&seeds[..]];
    
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.reit_mint.to_account_info(),
            to: ctx.accounts.user_reit_account.to_account_info(),
            authority: ctx.accounts.governance.to_account_info(),
        },
        signer_seeds,
    );
    token::mint_to(mint_ctx, tokens_to_mint)?;
    
    // Step 7: Emit SubscribeEvent
    emit!(SubscribeEvent {
        user: ctx.accounts.user.key(),
        usdc_amount,
        tokens_minted: tokens_to_mint,
        nav_at_subscription: nav_cents,
    });
    
    msg!(
        "Subscribe: {} USDC (fee: {}) -> {} tokens at NAV {} cents",
        usdc_amount,
        fee_amount,
        tokens_to_mint,
        nav_cents
    );
    
    Ok(())
}
