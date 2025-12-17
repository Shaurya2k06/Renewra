use anchor_lang::prelude::*;

/// Status of a redemption request
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum RedemptionStatus {
    /// Request submitted, awaiting approval
    Pending,
    /// Request approved by admin
    Approved,
    /// Tokens burned, USDC transferred
    Settled,
}

/// Individual redemption request
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub struct RedemptionRequest {
    /// User requesting redemption
    pub requester: Pubkey,
    
    /// Amount of tokens to redeem
    pub token_amount: u64,
    
    /// Unix timestamp when request was made
    pub requested_at: i64,
    
    /// Current status of the request
    pub status: RedemptionStatus,
}

impl RedemptionRequest {
    /// Space: 32 + 8 + 8 + 1 = 49 bytes (rounded to 48 for alignment)
    pub const SPACE: usize = 32 + 8 + 8 + 1;
}

/// RedemptionQueue PDA tracks all pending redemption requests.
/// Allocates space for up to 100 requests.
#[account]
#[derive(InitSpace)]
pub struct RedemptionQueue {
    /// Vector of redemption requests (max 100)
    #[max_len(100)]
    pub requests: Vec<RedemptionRequest>,
    
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl RedemptionQueue {
    /// PDA seed for redemption_queue account
    pub const SEED: &'static [u8] = b"redemption_queue";
    
    /// Maximum number of pending requests
    pub const MAX_REQUESTS: usize = 100;
    
    /// Space: 8 (discriminator) + 4 (vec len) + (49 * 100) + 1 = 4913 bytes
    pub const SPACE: usize = 8 + 4 + (RedemptionRequest::SPACE * Self::MAX_REQUESTS) + 1;
}
