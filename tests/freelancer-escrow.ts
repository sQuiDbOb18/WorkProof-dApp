import * as anchor from "@anchor-lang/core";
import { assert } from "chai";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("freelancer-escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.freelancerEscrow as any;
  const freelancer = Keypair.generate();
  const amountLamports = new anchor.BN(0.5 * LAMPORTS_PER_SOL);

  before(async () => {
    const signature = await provider.connection.requestAirdrop(
      freelancer.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature, "confirmed");
  });

  it("funds an escrow, accepts a submission, and releases funds on approval", async () => {
    const escrowSeed = "gig-001";
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        provider.wallet.publicKey.toBuffer(),
        freelancer.publicKey.toBuffer(),
        Buffer.from(escrowSeed),
      ],
      program.programId
    );

    await program.methods
      .initializeEscrow(escrowSeed, "Landing page redesign", amountLamports)
      .accounts({
        client: provider.wallet.publicKey,
        freelancer: freelancer.publicKey,
        escrow: escrowPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .submitWork("https://www.figma.com/proto/final-delivery")
      .accounts({
        freelancer: freelancer.publicKey,
        escrow: escrowPda,
      })
      .signers([freelancer])
      .rpc();

    const freelancerBefore = await provider.connection.getBalance(
      freelancer.publicKey
    );

    await program.methods
      .approveWork()
      .accounts({
        client: provider.wallet.publicKey,
        freelancer: freelancer.publicKey,
        escrow: escrowPda,
      })
      .rpc();

    const freelancerAfter = await provider.connection.getBalance(
      freelancer.publicKey
    );

    assert.isAtLeast(
      freelancerAfter - freelancerBefore,
      amountLamports.toNumber()
    );

    const escrowAccount = await provider.connection.getAccountInfo(escrowPda);
    assert.isNull(escrowAccount);
  });

  it("returns funds to the client when a dispute is raised", async () => {
    const escrowSeed = "gig-002";
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        provider.wallet.publicKey.toBuffer(),
        freelancer.publicKey.toBuffer(),
        Buffer.from(escrowSeed),
      ],
      program.programId
    );

    await program.methods
      .initializeEscrow(escrowSeed, "Mobile app QA", amountLamports)
      .accounts({
        client: provider.wallet.publicKey,
        freelancer: freelancer.publicKey,
        escrow: escrowPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .submitWork("https://notion.so/test-report")
      .accounts({
        freelancer: freelancer.publicKey,
        escrow: escrowPda,
      })
      .signers([freelancer])
      .rpc();

    await program.methods
      .raiseDispute("The submission does not match the requested deliverables.")
      .accounts({
        client: provider.wallet.publicKey,
        escrow: escrowPda,
      })
      .rpc();

    const escrowAccount = await provider.connection.getAccountInfo(escrowPda);
    assert.isNull(escrowAccount);
  });
});
