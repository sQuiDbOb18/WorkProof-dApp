use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("The escrow seed is too long.")]
    EscrowSeedTooLong,
    #[msg("The job title is too long.")]
    TitleTooLong,
    #[msg("The submission text or link is too long.")]
    SubmissionTooLong,
    #[msg("The dispute reason is too long.")]
    DisputeReasonTooLong,
    #[msg("Escrow amount must be greater than zero.")]
    InvalidAmount,
    #[msg("Only the freelancer can submit work for this escrow.")]
    UnauthorizedFreelancer,
    #[msg("Only the client can resolve this escrow.")]
    UnauthorizedClient,
    #[msg("This escrow is no longer accepting submissions.")]
    EscrowNotActive,
    #[msg("Work must be submitted before the client can resolve the escrow.")]
    WorkNotSubmitted,
    #[msg("Math overflow while moving lamports.")]
    MathOverflow,
}
