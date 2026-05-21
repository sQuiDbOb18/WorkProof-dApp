use crate::{
    error::ErrorCode,
    state::{Escrow, EscrowStatus},
    MAX_DISPUTE_REASON_LEN,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(
        mut,
        has_one = client @ ErrorCode::UnauthorizedClient,
        close = client
    )]
    pub escrow: Account<'info, Escrow>,
}

pub fn handler(ctx: Context<RaiseDispute>, reason: String) -> Result<()> {
    require!(
        reason.len() <= MAX_DISPUTE_REASON_LEN,
        ErrorCode::DisputeReasonTooLong
    );

    let escrow = &mut ctx.accounts.escrow;
    require!(
        escrow.status == EscrowStatus::Submitted,
        ErrorCode::WorkNotSubmitted
    );

    escrow.status = EscrowStatus::Disputed;
    escrow.dispute_reason = reason;
    escrow.updated_at = Clock::get()?.unix_timestamp;

    emit!(DisputeRaised {
        escrow: escrow.key(),
        client: ctx.accounts.client.key(),
    });

    Ok(())
}

#[event]
pub struct DisputeRaised {
    pub escrow: Pubkey,
    pub client: Pubkey,
}
