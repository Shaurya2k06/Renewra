use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z");

#[program]
pub mod renewra {
    use super::*;

    /// Initialize the Renewra fund with governance, NAV oracle, and redemption queue
    pub fn initialize_fund(
        ctx: Context<InitializeFund>,
        params: InitializeFundParams,
    ) -> Result<()> {
        instructions::initialize_fund::handler(ctx, params)
    }

    /// Submit a new NAV value (oracle signer only)
    pub fn submit_nav(ctx: Context<SubmitNav>, new_nav: u64) -> Result<()> {
        instructions::submit_nav::handler(ctx, new_nav)
    }

    /// Subscribe to the fund by depositing USDC and receiving REI tokens
    pub fn subscribe(ctx: Context<Subscribe>, usdc_amount: u64) -> Result<()> {
        instructions::subscribe::handler(ctx, usdc_amount)
    }

    /// Distribute yield to token holders pro-rata (admin only)
    pub fn distribute_yield(ctx: Context<DistributeYield>, yield_amount: u64) -> Result<()> {
        instructions::distribute_yield::handler(ctx, yield_amount)
    }

    /// Request redemption of REI tokens (queued for settlement)
    pub fn request_redeem(ctx: Context<RequestRedeem>, token_amount: u64) -> Result<()> {
        instructions::request_redeem::handler(ctx, token_amount)
    }
}
