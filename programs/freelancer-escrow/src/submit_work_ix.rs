use crate::{
    error::ErrorCode,
    state::{Escrow, EscrowStatus},
    MAX_WORK_SUBMISSION_LEN,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SubmitWork<'info> {
    #[account(mut)]
    pub freelancer: Signer<'info>,
    #[account(mut, has_one = freelancer @ ErrorCode::UnauthorizedFreelancer)]
    pub escrow: Account<'info, Escrow>,
}

pub fn handler(ctx: Context<SubmitWork>, submission: String) -> Result<()> {
    require!(
        submission.len() <= MAX_WORK_SUBMISSION_LEN,
        ErrorCode::SubmissionTooLong
    );

    let escrow = &mut ctx.accounts.escrow;
    require!(
        matches!(escrow.status, EscrowStatus::Funded | EscrowStatus::Submitted),
        ErrorCode::EscrowNotActive
    );

    escrow.submission = submission;
    escrow.status = EscrowStatus::Submitted;
    escrow.updated_at = Clock::get()?.unix_timestamp;

    emit!(WorkSubmitted {
        escrow: escrow.key(),
        freelancer: ctx.accounts.freelancer.key(),
    });

    Ok(())
}

#[event]
pub struct WorkSubmitted {
    pub escrow: Pubkey,
    pub freelancer: Pubkey,
}
