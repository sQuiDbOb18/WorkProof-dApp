# Freelancer Escrow on Solana

An interview-ready Solana escrow dApp built with Anchor. A client funds an escrow in SOL, a freelancer submits work as text or a delivery link, and the client either approves the work to release funds or raises a dispute to return the locked SOL.

## What this repo includes

- An Anchor program that stores escrow state and custody of deposited SOL
- TypeScript tests covering the approval and dispute flows
- A React + Vite frontend with Solana wallet connection
- Clear project structure, setup notes, and local development scripts

## Core flow

1. The client creates and funds an escrow PDA.
2. The freelancer submits work as plain text or a URL.
3. The client approves the work to release SOL to the freelancer.
4. Or the client disputes the work, which closes the escrow and returns funds to the client.

## Tech stack

- Solana
- Anchor
- Rust
- TypeScript
- React
- Vite
- Solana Wallet Adapter

## Project structure

```text
.
├── app/                        # React frontend
├── migrations/                 # Anchor deployment hook
├── programs/freelancer-escrow/ # On-chain program
├── tests/                      # Anchor TypeScript tests
├── Anchor.toml
├── Cargo.toml
└── package.json
```

## On-chain design

The `Escrow` account stores:

- `client`
- `freelancer`
- `escrow_seed`
- `title`
- `amount_lamports`
- `status`
- `submission`
- `dispute_reason`
- `created_at`
- `updated_at`

Each escrow is a PDA derived from:

```text
["escrow", client, freelancer, escrow_seed]
```

This makes it easy to support multiple gigs between the same client and freelancer.

## Program instructions

- `initialize_escrow`
  - Creates the escrow account and transfers the client deposit into it.
- `submit_work`
  - Lets the assigned freelancer attach a delivery note or URL.
- `approve_work`
  - Sends the escrowed SOL to the freelancer and closes the account.
- `raise_dispute`
  - Marks the escrow as disputed and closes the account back to the client.

## Local setup

### Prerequisites

- Rust
- Solana CLI
- Anchor CLI
- Node.js 20+
- A local validator or devnet wallet for testing

### Install dependencies

```bash
npm install
npm --prefix app install
```

### Build the program

```bash
anchor build
```

### Run tests

```bash
anchor test
```

### Start the frontend

```bash
npm run app:dev
```

By default the app points to `http://127.0.0.1:8899`. You can override it with `VITE_RPC_URL`.

## Suggested demo flow

1. Start `solana-test-validator`.
2. Build and deploy with `anchor build && anchor deploy`.
3. Open the app and connect a wallet.
4. Create an escrow with a freelancer public key and deposit amount.
5. Switch to the freelancer wallet and submit a GitHub, Figma, Loom, or live-demo link.
6. Switch back to the client wallet and approve or dispute the escrow.

## Notes for reviewers

- The contract intentionally keeps dispute resolution simple for the interview scope: a dispute refunds the client immediately.
- The frontend is lightweight by design and focuses on demonstrating the contract lifecycle clearly.
- The repository is organized so the on-chain logic, tests, and UI can each be reviewed independently.

## Future improvements

- Add third-party arbitration instead of client-only disputes
- Support SPL token escrows in addition to SOL
- Add escrow expiration windows and cancellation rules
- Persist richer off-chain metadata with IPFS or Arweave
- Add CI for formatting, tests, and Anchor builds

## License

MIT
