import { useEffect, useState } from "react";
import { BN } from "@anchor-lang/core";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { deriveEscrowPda, getProgram, SystemProgram } from "./lib/solana";

type EscrowAccount = {
  publicKey: PublicKey;
  account: {
    client: PublicKey;
    freelancer: PublicKey;
    escrowSeed: string;
    title: string;
    amountLamports: BN;
    status: unknown;
    submission: string;
    disputeReason: string;
  };
};

const emptyCreateForm = {
  freelancer: "",
  escrowSeed: "",
  title: "",
  amountSol: "",
};

function App() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [submissionText, setSubmissionText] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [selectedEscrow, setSelectedEscrow] = useState("");
  const [escrows, setEscrows] = useState<EscrowAccount[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    "Connect a wallet to create milestones, review submissions, and release payment."
  );
  const [loading, setLoading] = useState(false);

  const loadEscrows = async () => {
    if (!wallet.publicKey) {
      setEscrows([]);
      return;
    }

    try {
      const program = getProgram(connection, wallet) as any;
      const allEscrows =
        (await program.account.escrow.all()) as EscrowAccount[];
      const walletAddress = wallet.publicKey.toBase58();

      setEscrows(
        allEscrows.filter(({ account }) => {
          return (
            account.client.toBase58() === walletAddress ||
            account.freelancer.toBase58() === walletAddress
          );
        })
      );
    } catch (error) {
      console.error(error);
      setStatusMessage(
        "Unable to load escrow accounts. Make sure the program is deployed."
      );
    }
  };

  useEffect(() => {
    void loadEscrows();
  }, [wallet.publicKey]);

  const createEscrow = async () => {
    if (!wallet.publicKey) return;
    setLoading(true);

    try {
      const freelancer = new PublicKey(createForm.freelancer);
      const amountLamports = Math.round(
        Number(createForm.amountSol) * LAMPORTS_PER_SOL
      );
      const escrow = deriveEscrowPda(
        wallet.publicKey,
        freelancer,
        createForm.escrowSeed
      );
      const program = getProgram(connection, wallet) as any;

      await program.methods
        .initializeEscrow(
          createForm.escrowSeed,
          createForm.title,
          new BN(amountLamports)
        )
        .accounts({
          client: wallet.publicKey,
          freelancer,
          escrow,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setCreateForm(emptyCreateForm);
      setStatusMessage("Escrow created and funded successfully.");
      await loadEscrows();
    } catch (error) {
      console.error(error);
      setStatusMessage(
        "Failed to create escrow. Check the inputs and local deployment."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitWork = async () => {
    if (!wallet.publicKey || !selectedEscrow) return;
    setLoading(true);

    try {
      const program = getProgram(connection, wallet) as any;
      await program.methods
        .submitWork(submissionText)
        .accounts({
          freelancer: wallet.publicKey,
          escrow: new PublicKey(selectedEscrow),
        })
        .rpc();

      setSubmissionText("");
      setStatusMessage("Work submitted.");
      await loadEscrows();
    } catch (error) {
      console.error(error);
      setStatusMessage(
        "Submission failed. Make sure you are the assigned freelancer."
      );
    } finally {
      setLoading(false);
    }
  };

  const approveEscrow = async (
    escrowAddress: string,
    freelancer: PublicKey
  ) => {
    if (!wallet.publicKey) return;
    setLoading(true);

    try {
      const program = getProgram(connection, wallet) as any;
      await program.methods
        .approveWork()
        .accounts({
          client: wallet.publicKey,
          freelancer,
          escrow: new PublicKey(escrowAddress),
        })
        .rpc();

      setStatusMessage("Escrow approved and funds released.");
      await loadEscrows();
    } catch (error) {
      console.error(error);
      setStatusMessage(
        "Approval failed. Make sure you are the client for this escrow."
      );
    } finally {
      setLoading(false);
    }
  };

  const disputeEscrow = async (escrowAddress: string) => {
    if (!wallet.publicKey) return;
    setLoading(true);

    try {
      const program = getProgram(connection, wallet) as any;
      await program.methods
        .raiseDispute(disputeReason)
        .accounts({
          client: wallet.publicKey,
          escrow: new PublicKey(escrowAddress),
        })
        .rpc();

      setDisputeReason("");
      setStatusMessage("Dispute opened. Funds returned to the client.");
      await loadEscrows();
    } catch (error) {
      console.error(error);
      setStatusMessage(
        "Dispute failed. Make sure you are the client and work was submitted."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Solana Freelance Payments</p>
          <h1>Freelancer Escrow dApp</h1>
          <p className="hero-copy">
            Secure freelance payouts with on-chain escrow. Fund a job in SOL,
            collect the freelancer&apos;s delivery link or written handoff, then
            approve the release or raise a dispute from one shared workflow.
          </p>
        </div>
        <WalletMultiButton />
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Create Escrow</h2>
          <input
            placeholder="Freelancer wallet"
            value={createForm.freelancer}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                freelancer: event.target.value,
              }))
            }
          />
          <input
            placeholder="Escrow seed e.g. gig-001"
            value={createForm.escrowSeed}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                escrowSeed: event.target.value,
              }))
            }
          />
          <input
            placeholder="Job title"
            value={createForm.title}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
          <input
            placeholder="Amount in SOL"
            value={createForm.amountSol}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                amountSol: event.target.value,
              }))
            }
          />
          <button
            disabled={!wallet.publicKey || loading}
            onClick={() => void createEscrow()}
          >
            Fund Escrow
          </button>
        </article>

        <article className="panel">
          <h2>Submit Work</h2>
          <select
            value={selectedEscrow}
            onChange={(event) => setSelectedEscrow(event.target.value)}
          >
            <option value="">Select an escrow</option>
            {escrows.map(({ publicKey, account }) => (
              <option key={publicKey.toBase58()} value={publicKey.toBase58()}>
                {account.title} · {account.escrowSeed}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Paste a delivery note, GitHub repo, Figma link, or demo URL"
            value={submissionText}
            onChange={(event) => setSubmissionText(event.target.value)}
          />
          <button
            disabled={!wallet.publicKey || loading || !selectedEscrow}
            onClick={() => void submitWork()}
          >
            Submit Work
          </button>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Escrow Activity</h2>
          <button className="ghost-button" onClick={() => void loadEscrows()}>
            Refresh
          </button>
        </div>
        <p className="status-text">{statusMessage}</p>
        <div className="escrow-list">
          {escrows.map(({ publicKey, account }) => (
            <article key={publicKey.toBase58()} className="escrow-card">
              <div className="escrow-card__top">
                <div>
                  <h3>{account.title}</h3>
                  <p>{account.escrowSeed}</p>
                </div>
                <span className="pill">{JSON.stringify(account.status)}</span>
              </div>
              <p>
                <strong>Client:</strong> {account.client.toBase58()}
              </p>
              <p>
                <strong>Freelancer:</strong> {account.freelancer.toBase58()}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {(account.amountLamports.toNumber() / LAMPORTS_PER_SOL).toFixed(
                  2
                )}{" "}
                SOL
              </p>
              <p>
                <strong>Submission:</strong>{" "}
                {account.submission || "No submission yet"}
              </p>
              <textarea
                placeholder="Optional dispute reason"
                value={disputeReason}
                onChange={(event) => setDisputeReason(event.target.value)}
              />
              <div className="actions">
                <button
                  disabled={!wallet.publicKey || loading}
                  onClick={() =>
                    void approveEscrow(publicKey.toBase58(), account.freelancer)
                  }
                >
                  Approve
                </button>
                <button
                  className="danger-button"
                  disabled={!wallet.publicKey || loading}
                  onClick={() => void disputeEscrow(publicKey.toBase58())}
                >
                  Dispute
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
