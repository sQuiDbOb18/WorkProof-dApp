use crate::{
    MAX_DISPUTE_REASON_LEN, MAX_ESCROW_SEED_LEN, MAX_TITLE_LEN, MAX_WORK_SUBMISSION_LEN,
};
use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub escrow_seed: String,
    pub title: String,
    pub amount_lamports: u64,
    pub status: EscrowStatus,
    pub submission: String,
    pub dispute_reason: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl Escrow {
    pub const SPACE: usize = 8
        + 32
        + 32
        + 4
        + MAX_ESCROW_SEED_LEN
        + 4
        + MAX_TITLE_LEN
        + 8
        + 1
        + 4
        + MAX_WORK_SUBMISSION_LEN
        + 4
        + MAX_DISPUTE_REASON_LEN
        + 8
        + 8
        + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum EscrowStatus {
    Funded,
    Submitted,
    Approved,
    Disputed,
}
