pub mod constants;
pub mod error;
pub mod approve_work_ix;
pub mod initialize_escrow_ix;
pub mod instructions;
pub mod raise_dispute_ix;
pub mod state;
pub mod submit_work_ix;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("8cu8XyCkPstLaLeFEAvSP7RHPXkz35hwNLbn1dF84JB");

#[program]
pub mod freelancer_escrow {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        escrow_seed: String,
        title: String,
        amount_lamports: u64,
    ) -> Result<()> {
        initialize_escrow_ix::handler(ctx, escrow_seed, title, amount_lamports)
    }

    pub fn submit_work(ctx: Context<SubmitWork>, submission: String) -> Result<()> {
        submit_work_ix::handler(ctx, submission)
    }

    pub fn approve_work(ctx: Context<ApproveWork>) -> Result<()> {
        approve_work_ix::handler(ctx)
    }

    pub fn raise_dispute(ctx: Context<RaiseDispute>, reason: String) -> Result<()> {
        raise_dispute_ix::handler(ctx, reason)
    }
}
