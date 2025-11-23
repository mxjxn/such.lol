# Such.lol

[Such.lol](https://such.lol) will be the home for Farcaster-centric jokeraces on degen L3

Jokerace for Degen L3 with comprehensive Farcaster integration.

## 🎉 Farcaster Integration (Implemented)

Such.lol features full Farcaster integration with both **MiniApp** and **Frames** support, enabling seamless contest participation directly from Farcaster.

### Architecture Overview

The Farcaster integration consists of two main components:

#### 1. **Farcaster MiniApp Extension** (`packages/farcaster-miniapp-extension`)

A standalone Next.js application that enables users to view and participate in JokeRace contests directly within Farcaster clients.

**Features:**
- ✅ **MiniApp SDK Integration** - Full integration with `@farcaster/miniapp-sdk`
- ✅ **Contest Viewer** - Display contest details from blockchain
- ✅ **Multi-Chain Support** - Ethereum, Base, Optimism, Arbitrum, Polygon, Degen L3
- ✅ **User Context** - Automatic Farcaster profile integration (FID, username, profile pic)
- ✅ **Real-time Status** - Live contest phase detection (submission/voting periods)
- ✅ **Direct Blockchain Queries** - Reads from smart contracts using Viem
- ✅ **Responsive UI** - Optimized for Farcaster MiniApp environment

**Tech Stack:**
- Next.js 14 (App Router)
- @farcaster/miniapp-sdk
- Viem (blockchain interaction)
- TailwindCSS
- TypeScript

**Usage:**
```bash
cd packages/farcaster-miniapp-extension
npm install
npm run dev  # Runs on port 3001
```

Access contests at: `/contest/{chain}/{address}`

See the [MiniApp Extension README](packages/farcaster-miniapp-extension/README.md) for detailed documentation.

#### 2. **Farcaster Frames API** (`packages/farcaster-miniapp-extension/src/app/api/frame/`)

Three Frame endpoints that enable sharing contests and submissions on Farcaster with interactive buttons:

##### **Contest Frame** (`/api/frame/contest/[chain]/[address]`)
Share contests with interactive preview:
- View Contest button → Opens in MiniApp
- Submit Entry button → Direct submission link
- Vote button → Voting interface

##### **Submission Frame** (`/api/frame/submission/[chain]/[address]/[id]`)
Share individual submissions:
- Vote For button → Vote in favor
- Vote Against button → Vote against
- View Contest button → See full contest
- Visit button → View submission details

##### **Vote Frame** (`/api/frame/vote/[chain]/[address]`)
Share voting opportunities:
- Vote Now button (shows # of entries) → Opens voting interface
- View Results button (when voting closed) → See results
- Dynamic status based on contest phase

**Features:**
- Open Graph meta tags for rich previews
- Dynamic frame images via `/api/og/` routes
- Real-time contest phase detection
- Automatic caching (5min for contests, 1min for voting status)
- Error handling with fallback frames

**Example URLs:**
```
Contest: https://such.lol/api/frame/contest/base/0x1234...
Submission: https://such.lol/api/frame/submission/base/0x1234.../42
Voting: https://such.lol/api/frame/vote/base/0x1234...
```

#### 3. **Main App Farcaster Integration** (`packages/react-app-revamp`)

The main JokeRace app also includes Farcaster integration components:

- **FarcasterProvider** (`components/FarcasterProvider/`) - React context provider for MiniApp SDK
- **useFarcasterProfile** (`hooks/useFarcasterProfile/`) - Hook to access Farcaster user data
- **Share functionality** - Farcaster sharing in submission and contest pages

### How It Works

1. **User opens contest in Farcaster** → Frame displays with interactive buttons
2. **Clicks "View Contest"** → Opens in MiniApp Extension
3. **MiniApp loads** → SDK initializes, fetches user profile (FID, username, etc.)
4. **Contest data loads** → Viem queries blockchain for contest details, submissions, voting status
5. **User interacts** → Can browse, submit (planned), and vote (planned)
6. **Real-time updates** → Contest phases update automatically based on blockchain timestamps

### Supported Chains

- Ethereum (ethereum, eth)
- Base (base)
- Optimism (optimism, opt)
- Arbitrum (arbitrum, arb)
- Polygon (polygon, matic)
- Degen L3 (degen)

### Environment Variables (Optional)

```env
NEXT_PUBLIC_BASE_URL=https://such.lol  # For Frame URLs in production
```

## 🏆 NFT Winner Minting Extension (Implemented)

Immortalize winning contest submissions as 1/1 NFTs using Manifold Creator Core contracts.

### Overview

The NFT Winner Minting Extension enables contest creators to mint winning submissions as unique NFTs. Each winner receives a 1/1 NFT containing their submission content, ranking, and contest metadata.

**Package:** `packages/nft-winner-minting` (Port 3002)

### Features

- ✅ **Manifold Creator Core Integration** - Battle-tested NFT infrastructure
- ✅ **1/1 NFT Minting** - Each winner gets a unique NFT
- ✅ **Multi-Chain Support** - Ethereum, Base, Optimism, Arbitrum, Polygon
- ✅ **Batch Minting** - Mint multiple winners in one transaction
- ✅ **Rich On-Chain Metadata** - Ranking, submission content, author info
- ✅ **Permission-Based** - Only creator admins can authorize and mint
- ✅ **Duplicate Protection** - Rankings can only be minted once

### How It Works

1. **Contest Creator** deploys a Manifold Creator contract (or uses existing)
2. **Authorize Contest** - Enable NFT minting for a specific contest
3. **Set Max Winners** - Specify how many top winners can be minted
4. **Mint Winners** - Select rankings (e.g., #1, #2, #3) and mint as 1/1 NFTs
5. **Winners Receive NFTs** - Each winner's wallet receives their unique NFT

### Tech Stack

- **Smart Contracts**: Solidity 0.8.19 + Manifold Creator Core
- **Frontend**: Next.js 14, Wagmi, RainbowKit
- **Blockchain**: Viem for contract interactions
- **Styling**: TailwindCSS

### Usage

```bash
cd packages/nft-winner-minting
npm install
npm run dev  # Runs on port 3002
```

**Requirements:**
- Manifold Creator contract (create at [studio.manifold.xyz](https://studio.manifold.xyz/))
- WinnerMinter.sol deployed to your chain
- Admin access to creator contract

See the [NFT Minting Extension README](packages/nft-winner-minting/README.md) for detailed documentation.

## 🚧 Features to Build

- **Submission Creation UI** - Interface for creating submissions in MiniApp
- **Voting Interface** - Full voting UI with transaction signing
- **Submission Gallery** - Browse and filter submissions
- **Vote Leaderboard** - Real-time ranking and results
- **NFT Artwork Generation** - Custom visuals for minted NFTs
- **IPFS Metadata Storage** - Decentralized metadata hosting
- Specific contest formats (specific form types)
- Expanded rewards (DEGEN, multiple winners/rewards, etc.)
- Contest notifications for phase changes

---

# jokerace • [![Forge Tests](https://github.com/jk-labs-inc/jokerace/actions/workflows/forge_tests.yml/badge.svg)](https://github.com/JokeDAO/JokeDaoV2Dev/actions/workflows/forge_tests.yml)

Check out the live site at [jokerace.io](https://jokerace.io/)!

Also, our smart contracts were audited by Certik in September 2023, check out the audit report [here](https://github.com/jk-labs-inc/jokerace-audits/blob/main/audit-reports/Sept23_Certik_Final_Report.pdf)!

One other fun thing: you can find v1 at [jokedao.jokedao.io](https://jokedao.jokedao.io)!

## Pre-requisites
- `yarn` or `npm` installed
- `node` version >= `17.0.0` (18+ recommended)
- Have an Ethereum wallet (like MetaMask for instance)

## Quick Start

This monorepo contains three main applications:

### 1. **Main JokeRace App** (`packages/react-app-revamp`)
The primary JokeRace web application (port 3000).

### 2. **Farcaster MiniApp Extension** (`packages/farcaster-miniapp-extension`)
Standalone Farcaster integration (port 3001).

### 3. **NFT Winner Minting Extension** (`packages/nft-winner-minting`)
Mint winning submissions as 1/1 NFTs using Manifold (port 3002).

## Setup Instructions

### Main App Setup

- Install dependencies with `yarn install` (from root)
- Create a `.env` file in `packages/react-app-revamp` and paste the following values:

Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_R2_ACCOUNT_ID=
NEXT_PUBLIC_R2_ACCESS_KEY_ID=
NEXT_PUBLIC_R2_SECRET_ACCESS_KEY=
NEXT_PUBLIC_MERKLE_TREES_BUCKET=
```

Optional
```
NEXT_PUBLIC_ALCHEMY_KEY=
NEXT_PUBLIC_IMGUR_CLIENT_ID=
```
## Getting Started

### Running the Main App

Navigate to the top directory of this repo and run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

**Usage Note:** If you are not running Supabase, then the search functionality will not work. You can still access contests and the full functionality of the site, though, by visiting the URL with the format `http://localhost:3000/contest/{chain}/{contest_address}` where `chain` is the name of the chain that the contest is on as specified [here](https://github.com/jk-labs-inc/jokerace/blob/staging/packages/react-app-revamp/config/wagmi/index.ts), and `contest_address` is the address of the contest contract on that chain.

### Running the Farcaster MiniApp Extension

The Farcaster MiniApp runs on a separate port (3001) and can be started independently:

```bash
cd packages/farcaster-miniapp-extension
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser, or access contests directly at:
```
http://localhost:3001/contest/{chain}/{address}
```

**No environment variables required** - the MiniApp queries blockchain data directly using public RPC endpoints.

For production deployment, set `NEXT_PUBLIC_BASE_URL` in `.env` to your domain for proper Frame URL generation.

### Running All Apps Simultaneously

To run all three applications at the same time:

**Terminal 1:**
```bash
yarn dev  # Main app on :3000
```

**Terminal 2:**
```bash
cd packages/farcaster-miniapp-extension && npm run dev  # Farcaster MiniApp on :3001
```

**Terminal 3:**
```bash
cd packages/nft-winner-minting && npm run dev  # NFT Minting on :3002
```

## Repository Structure

```
such.lol/
├── packages/
│   ├── react-app-revamp/          # Main JokeRace web app (port 3000)
│   │   ├── app/                   # Next.js app router
│   │   ├── components/            # React components
│   │   │   ├── FarcasterProvider/ # Farcaster SDK context provider
│   │   │   └── Share/             # Social sharing (includes Farcaster)
│   │   ├── hooks/                 # React hooks
│   │   │   └── useFarcasterProfile/ # Hook for Farcaster user data
│   │   └── ...
│   │
│   ├── farcaster-miniapp-extension/  # Farcaster MiniApp (port 3001)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── api/
│   │       │   │   ├── frame/     # Farcaster Frame endpoints
│   │       │   │   │   ├── contest/   # Contest frame
│   │       │   │   │   ├── submission/ # Submission frame
│   │       │   │   │   └── vote/      # Voting frame
│   │       │   │   └── og/        # Open Graph images
│   │       │   ├── contest/       # Contest viewer pages
│   │       │   ├── providers.tsx  # Farcaster context provider
│   │       │   └── page.tsx       # Home page
│   │       └── hooks/
│   │           └── useContestData.ts # Blockchain data fetching
│   │
│   ├── nft-winner-minting/        # NFT Winner Minting (port 3002)
│   │   └── src/
│   │       ├── app/               # Next.js app
│   │       ├── contracts/         # Smart contracts
│   │       │   └── WinnerMinter.sol  # Manifold extension contract
│   │       ├── components/        # React components
│   │       │   ├── ContestInput.tsx  # Contest configuration
│   │       │   ├── WinnerList.tsx    # Display winners
│   │       │   └── MintingInterface.tsx # Minting UI
│   │       ├── hooks/
│   │       │   └── useContestWinners.ts # Fetch winners
│   │       └── lib/
│   │           ├── wagmi.ts       # Wagmi configuration
│   │           └── contracts.ts   # Contract ABIs and addresses
│   │
│   └── forge/                     # Smart contracts (Foundry)
│       └── src/
│           └── Contest.sol        # JokeRace contest contract
│
└── README.md                      # This file
```

## Development Notes

### Updating bytecode

Whenever you make a change to smart contracts or really whenever the bytecode files change (could be that [the compiler version got changed and so no bytecode changed, but remappings were reformatted](https://github.com/jk-labs-inc/jokerace/pull/509)), increment the version by `x.1`. Then generate the bytecode and version it as described below.

The purpose of this is so that we have a way to tell exactly what bytecode a contract that we read from a chain has and exactly how it was deployed given its version number.

In order to generate and/or update the bytecode of your project, run 

```bash
yarn smartcheck
```

Upon a successful `forge fmt`, `forge test -vv`, and `forge build` of the smart contract code, this will copy the generated bytecode and ABI into the `react-app-revamp` (the frontend) package so that the app can access it.

You will also need to do two more things if the ABI is changed:
  - Make a copy of the bytecode and abi in the versioning folder `packages/react-app-revamp/contracts/bytecodeAndAbi` by copying the content in `Contest.sol`, which is the latest version of bytecode, into a new folder in `contracts/bytecodeAndAbi` and renaming that folder with the incremented version following the convention.
  - Update ABI parser code in `packages/react-app-revamp/helpers/getContestContractVersion.ts` to use the new version if a contract's `version()` function returns the value of your newly incremented version.
  - Repeat the above 2 steps for `RewardsModule.sol` as well if that has changed.
  
[Here](https://github.com/jk-labs-inc/jokerace/pull/111/commits/79072b212e603bcca0418dd5057557379444194f) is an example PR that does all of these steps.

*Make sure to do all of these steps before committing any changes to the contract code to make sure that the bytecode that the site is deploying is the same as what you have written in the `forge` package! And also so that the site is able to correctly version a given deployed contract's ABI when reading from it.*

## Built with

### Main App
- NextJS 14
- Tailwind CSS & Headless-UI
- ethers, wagmi, @wagmi/core, @rainbow-me/rainbowkit
- zustand
- @farcaster/miniapp-sdk
- [Vercel](https://vercel.com/?utm_source=jokedao&utm_campaign=oss)

### Farcaster MiniApp Extension
- NextJS 14 (App Router)
- @farcaster/miniapp-sdk
- @neynar/nodejs-sdk
- Viem (blockchain interaction)
- TailwindCSS
- TypeScript

jokerace front-end is hosted on [Vercel](https://vercel.com/?utm_source=jokedao&utm_campaign=oss).

## Farcaster Resources

- **Farcaster MiniApp SDK**: [@farcaster/miniapp-sdk](https://www.npmjs.com/package/@farcaster/miniapp-sdk)
- **MiniApp Documentation**: [Farcaster MiniApps Docs](https://miniapps.farcaster.xyz/)
- **Frames Documentation**: [Farcaster Frames](https://docs.farcaster.xyz/learn/what-is-farcaster/frames)
- **Neynar SDK**: [@neynar/nodejs-sdk](https://www.npmjs.com/package/@neynar/nodejs-sdk)
- **JokeRace Extension Guide**: [Building an Extension](https://docs.jokerace.io/technical-how-tos/building-an-extension)

## Contributing

Contributions are welcome! Key areas for contribution:

### Farcaster Features
- Submission creation UI in MiniApp
- Voting interface with wallet transaction signing
- Submission gallery/browsing
- Real-time leaderboards
- Push notifications for contest phases
- Frame metadata optimization

### General Features
- Contest templates and formats
- Reward distribution mechanisms
- Multi-winner support
- Enhanced search and discovery

Please see individual package READMEs for more specific contribution guidelines.
