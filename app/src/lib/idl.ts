import type { Idl } from "@anchor-lang/core";

export const PROGRAM_ID = "8cu8XyCkPstLaLeFEAvSP7RHPXkz35hwNLbn1dF84JB";

export const freelancerEscrowIdl: Idl = {
  address: PROGRAM_ID,
  metadata: {
    name: "freelancer_escrow",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Freelance escrow on Solana using Anchor.",
  },
  instructions: [
    {
      name: "initializeEscrow",
      discriminator: [243, 160, 77, 153, 11, 92, 48, 209],
      accounts: [
        { name: "client", writable: true, signer: true },
        { name: "freelancer" },
        { name: "escrow", writable: true, signer: false },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "escrowSeed", type: "string" },
        { name: "title", type: "string" },
        { name: "amountLamports", type: "u64" },
      ],
    },
    {
      name: "submitWork",
      discriminator: [158, 80, 101, 51, 114, 130, 101, 253],
      accounts: [
        { name: "freelancer", writable: true, signer: true },
        { name: "escrow", writable: true, signer: false },
      ],
      args: [{ name: "submission", type: "string" }],
    },
    {
      name: "approveWork",
      discriminator: [181, 118, 45, 143, 204, 88, 237, 109],
      accounts: [
        { name: "client", writable: true, signer: true },
        { name: "freelancer", writable: true, signer: false },
        { name: "escrow", writable: true, signer: false },
      ],
      args: [],
    },
    {
      name: "raiseDispute",
      discriminator: [41, 243, 1, 51, 150, 95, 246, 73],
      accounts: [
        { name: "client", writable: true, signer: true },
        { name: "escrow", writable: true, signer: false },
      ],
      args: [{ name: "reason", type: "string" }],
    },
  ],
  accounts: [
    {
      name: "escrow",
      discriminator: [31, 213, 123, 187, 186, 22, 218, 155],
    },
  ],
  types: [
    {
      name: "escrow",
      type: {
        kind: "struct",
        fields: [
          { name: "client", type: "pubkey" },
          { name: "freelancer", type: "pubkey" },
          { name: "escrowSeed", type: "string" },
          { name: "title", type: "string" },
          { name: "amountLamports", type: "u64" },
          { name: "status", type: { defined: { name: "escrowStatus" } } },
          { name: "submission", type: "string" },
          { name: "disputeReason", type: "string" },
          { name: "createdAt", type: "i64" },
          { name: "updatedAt", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "escrowStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "funded" },
          { name: "submitted" },
          { name: "approved" },
          { name: "disputed" },
        ],
      },
    },
  ],
};
