use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z");

#[program]
pub mod contracts {
    use super::*;

    /// Initialize the Renewra fund with all required accounts
    pub fn initialize_fund(
        ctx: Context<InitializeFund>,
        params: InitializeFundParams,
    ) -> Result<()> {
        instructions::initialize_fund::handler(ctx, params)
    }

    /// Submit a new NAV value (oracle only)
    pub fn submit_nav(ctx: Context<SubmitNav>, new_nav: u64) -> Result<()> {
        instructions::submit_nav::handler(ctx, new_nav)
    }

    /// Subscribe to the fund by depositing USDC
    pub fn subscribe(ctx: Context<Subscribe>, usdc_amount: u64) -> Result<()> {
        instructions::subscribe::handler(ctx, usdc_amount)
    }

    /// Distribute yield to token holders (admin only)
    pub fn distribute_yield(ctx: Context<DistributeYield>, yield_amount: u64) -> Result<()> {
        instructions::distribute_yield::handler(ctx, yield_amount)
    }

    /// Request redemption of tokens
    pub fn request_redeem(ctx: Context<RequestRedeem>, token_amount: u64) -> Result<()> {
        instructions::request_redeem::handler(ctx, token_amount)
    }
}
