use anchor_lang::prelude::*;

#[constant]
pub const ESCROW_SEED: &str = "escrow";
pub const MAX_ESCROW_SEED_LEN: usize = 32;
pub const MAX_TITLE_LEN: usize = 64;
pub const MAX_WORK_SUBMISSION_LEN: usize = 280;
pub const MAX_DISPUTE_REASON_LEN: usize = 280;
