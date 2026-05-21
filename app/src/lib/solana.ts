import * as anchor from "@anchor-lang/core";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@anchor-lang/core";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { freelancerEscrowIdl, PROGRAM_ID } from "./idl";

export const getProgram = (
  connection: anchor.web3.Connection,
  wallet: WalletContextState
) => {
  const provider = new AnchorProvider(connection, wallet as never, {
    commitment: "confirmed",
  });

  return new Program(freelancerEscrowIdl, provider);
};

export const deriveEscrowPda = (
  client: PublicKey,
  freelancer: PublicKey,
  escrowSeed: string
) =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      client.toBuffer(),
      freelancer.toBuffer(),
      Buffer.from(escrowSeed),
    ],
    new PublicKey(PROGRAM_ID)
  )[0];

export { SystemProgram };
