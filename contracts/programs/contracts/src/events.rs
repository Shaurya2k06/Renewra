use anchor_lang::prelude::*;

#[event]
pub struct SubscribeEvent {
    pub user: Pubkey,
    pub usdc_amount: u64,
    pub tokens_minted: u64,
    pub nav_at_subscription: u64,
    pub timestamp: i64,
}

#[event]
pub struct NavUpdateEvent {
    pub old_nav: u64,
    pub new_nav: u64,
    pub total_supply: u64,
    pub timestamp: i64,
}

#[event]
pub struct DistributeYieldEvent {
    pub total_yield_amount: u64,
    pub per_token_yield: u64,
    pub total_supply: u64,
    pub timestamp: i64,
}

#[event]
pub struct RedeemRequestEvent {
    pub user: Pubkey,
    pub token_amount: u64,
    pub nav_at_request: u64,
    pub request_id: u64,
    pub timestamp: i64,
}

#[event]
pub struct RedeemSettledEvent {
    pub user: Pubkey,
    pub token_amount: u64,
    pub usdc_amount: u64,
    pub request_id: u64,
    pub timestamp: i64,
}

#[event]
pub struct FundPausedEvent {
    pub paused: bool,
    pub timestamp: i64,
}
