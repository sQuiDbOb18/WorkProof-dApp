use crate::{
    error::ErrorCode,
    state::{Escrow, EscrowStatus},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ApproveWork<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(mut)]
    pub freelancer: SystemAccount<'info>,
    #[account(
        mut,
        has_one = client @ ErrorCode::UnauthorizedClient,
        has_one = freelancer,
        close = client
    )]
    pub escrow: Account<'info, Escrow>,
}

pub fn handler(ctx: Context<ApproveWork>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    require!(
        escrow.status == EscrowStatus::Submitted,
        ErrorCode::WorkNotSubmitted
    );

    escrow.status = EscrowStatus::Approved;
    escrow.updated_at = Clock::get()?.unix_timestamp;

    let escrow_info = escrow.to_account_info();
    let freelancer_info = ctx.accounts.freelancer.to_account_info();

    let updated_escrow_lamports = escrow_info
        .lamports()
        .checked_sub(escrow.amount_lamports)
        .ok_or(ErrorCode::MathOverflow)?;
    let updated_freelancer_lamports = freelancer_info
        .lamports()
        .checked_add(escrow.amount_lamports)
        .ok_or(ErrorCode::MathOverflow)?;

    **escrow_info.try_borrow_mut_lamports()? = updated_escrow_lamports;
    **freelancer_info.try_borrow_mut_lamports()? = updated_freelancer_lamports;

    emit!(WorkApproved {
        escrow: escrow.key(),
        client: ctx.accounts.client.key(),
        freelancer: ctx.accounts.freelancer.key(),
        amount_lamports: escrow.amount_lamports,
    });

    Ok(())
}

#[event]
pub struct WorkApproved {
    pub escrow: Pubkey,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount_lamports: u64,
}
