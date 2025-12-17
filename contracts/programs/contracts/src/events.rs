use anchor_lang::prelude::*;

/// Emitted when a user subscribes (mints) tokens
#[event]
pub struct SubscribeEvent {
    pub user: Pubkey,
    pub usdc_amount: u64,
    pub tokens_minted: u64,
    pub nav_at_subscription: u64,
}

/// Emitted when oracle updates the NAV
#[event]
pub struct NavUpdateEvent {
    pub old_nav: u64,
    pub new_nav: u64,
    pub timestamp: i64,
    pub oracle_signer: Pubkey,
}

/// Emitted when yield is distributed to token holders
#[event]
pub struct DistributeYieldEvent {
    pub yield_amount: u64,
    pub total_token_supply: u64,
    pub per_token_yield: u128,
}

/// Emitted when a user requests redemption
#[event]
pub struct RedeemRequestEvent {
    pub requester: Pubkey,
    pub token_amount: u64,
    pub requested_at: i64,
    pub request_id: u64,
}

/// Emitted when fund is paused or unpaused
#[event]
pub struct PauseEvent {
    pub paused: bool,
    pub triggered_by: Pubkey,
    pub timestamp: i64,
}
