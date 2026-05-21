use crate::{
    error::ErrorCode,
    state::{Escrow, EscrowStatus},
    ESCROW_SEED, MAX_ESCROW_SEED_LEN, MAX_TITLE_LEN,
};
use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

#[derive(Accounts)]
#[instruction(escrow_seed: String)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    /// CHECK: The counterparty is only recorded on-chain.
    pub freelancer: UncheckedAccount<'info>,
    #[account(
        init,
        payer = client,
        space = Escrow::SPACE,
        seeds = [ESCROW_SEED.as_bytes(), client.key().as_ref(), freelancer.key().as_ref(), escrow_seed.as_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeEscrow>,
    escrow_seed: String,
    title: String,
    amount_lamports: u64,
) -> Result<()> {
    require!(
        escrow_seed.len() <= MAX_ESCROW_SEED_LEN,
        ErrorCode::EscrowSeedTooLong
    );
    require!(title.len() <= MAX_TITLE_LEN, ErrorCode::TitleTooLong);
    require!(amount_lamports > 0, ErrorCode::InvalidAmount);

    let now = Clock::get()?.unix_timestamp;
    let escrow = &mut ctx.accounts.escrow;

    escrow.client = ctx.accounts.client.key();
    escrow.freelancer = ctx.accounts.freelancer.key();
    escrow.escrow_seed = escrow_seed;
    escrow.title = title;
    escrow.amount_lamports = amount_lamports;
    escrow.status = EscrowStatus::Funded;
    escrow.submission = String::new();
    escrow.dispute_reason = String::new();
    escrow.created_at = now;
    escrow.updated_at = now;
    escrow.bump = ctx.bumps.escrow;

    transfer(
        CpiContext::new(
            ctx.accounts.system_program.key(),
            Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: escrow.to_account_info(),
            },
        ),
        amount_lamports,
    )?;

    emit!(EscrowCreated {
        escrow: escrow.key(),
        client: escrow.client,
        freelancer: escrow.freelancer,
        amount_lamports,
    });

    Ok(())
}

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount_lamports: u64,
}
