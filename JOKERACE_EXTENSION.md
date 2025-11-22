# JokeRace Farcaster MiniApp Extension

## Overview

This repository contains a **JokeRace Extension** that enables Farcaster MiniApp functionality for JokeRace contests. Built as a standalone Next.js application following the [official JokeRace extension guidelines](https://docs.jokerace.io/technical-how-tos/building-an-extension).

## What is a JokeRace Extension?

JokeRace extensions are 3rd party integrations built permissionlessly on top of JokeRace's protocol that extend the features and functionality of contests. They:

- Query blockchain data directly (no API needed)
- Provide standalone pages for contests
- Support multiple EVM chains
- Can be featured on JokeRace's website

## Extension Location

📂 **`/packages/farcaster-miniapp-extension/`**

## Key Features

### ✅ Core Functionality

- **Farcaster MiniApp Integration** - Full `@farcaster/miniapp-sdk` support
- **Contest Viewer** - Display full contest details from blockchain
- **Multi-Chain Support** - Ethereum, Base, Optimism, Arbitrum, Polygon
- **User Context** - Automatic Farcaster profile integration (FID, username, pfp)
- **Real-time Status** - Live detection of submission/voting phases
- **Direct Blockchain Access** - Reads smart contract data using Viem

### 🎯 User Experience

- **URL Input** - Paste any JokeRace contest URL to view in MiniApp
- **Deep Linking** - Direct navigation to `/contest/{chain}/{address}`
- **Profile Display** - Shows connected Farcaster user info
- **Contest Status** - Clear indication of submission/voting periods
- **Original Link** - Easy access back to main JokeRace site

## Architecture

### Technology Stack

```
Next.js 14 (App Router)
├── @farcaster/miniapp-sdk    # Farcaster integration
├── viem                        # Blockchain queries
├── wagmi                       # React hooks for Ethereum
└── TailwindCSS                # Styling
```

### Project Structure

```
packages/farcaster-miniapp-extension/
├── src/
│   ├── app/
│   │   ├── contest/[chain]/[address]/
│   │   │   └── page.tsx              # Contest viewer
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home with URL input
│   │   ├── providers.tsx             # Farcaster context
│   │   └── globals.css
│   ├── hooks/
│   │   └── useContestData.ts         # Blockchain data hook
│   └── lib/
├── extension.json                     # Extension manifest
├── README.md                          # Detailed documentation
└── package.json
```

## How It Works

### 1. Farcaster Integration

```typescript
// Initializes SDK and provides user context
import { sdk } from '@farcaster/miniapp-sdk';

await sdk.actions.ready();
const user = sdk.context.user;
// → { fid, username, displayName, pfpUrl }
```

### 2. Blockchain Data Fetching

```typescript
// Queries contest smart contract directly
const contest = await client.readContract({
  address: contestAddress,
  abi: CONTEST_ABI,
  functionName: 'name',
});
```

### 3. Phase Detection

```typescript
// Calculates current contest phase
const now = BigInt(Math.floor(Date.now() / 1000));
const submissionEnd = contestStart + votingDelay;
const votingEnd = submissionEnd + votingPeriod;

const submissionOpen = now >= contestStart && now < submissionEnd;
const votingOpen = now >= submissionEnd && now < votingEnd;
```

## Usage

### Development

```bash
cd packages/farcaster-miniapp-extension
npm install
npm run dev
```

Runs on `http://localhost:3001`

### Access from Farcaster

1. Deploy the extension to a public URL
2. Open the URL in a Farcaster client
3. Your profile is automatically detected
4. Enter a contest URL or navigate directly

### Example URLs

```
Home:
https://your-extension.com/

Direct Contest Access:
https://your-extension.com/contest/base/0x1234...
https://your-extension.com/contest/ethereum/0xabcd...
```

## JokeRace Extension Compliance

✅ **Standalone Pages** - Each contest has a dedicated page at `/contest/{chain}/{address}`
✅ **Direct Blockchain Access** - Uses Viem to query contracts directly, no API
✅ **Multi-Chain Support** - Ethereum, Base, Optimism, Arbitrum, Polygon
✅ **Clear Documentation** - Comprehensive README and inline explanations
✅ **Permissionless** - Can be deployed and run independently
✅ **Deep Linkable** - Direct URLs work for all contests

## Extension Manifest

The extension includes a `extension.json` manifest describing its capabilities:

```json
{
  "name": "Farcaster MiniApp Extension",
  "type": "miniapp",
  "platform": "farcaster",
  "features": [
    "contest-viewer",
    "user-authentication",
    "multi-chain-support"
  ],
  "compliance": {
    "jokerace_extension_spec": "v1",
    "standalone_pages": true,
    "direct_blockchain_access": true,
    "no_api_dependency": true
  }
}
```

## API Reference

### Hook: `useContestData(chain, address)`

Fetches and monitors contest data from blockchain.

**Parameters:**
- `chain` - Network name (ethereum, base, optimism, arbitrum, polygon)
- `address` - Contest contract address (0x...)

**Returns:**
```typescript
{
  contest: {
    name: string;
    prompt: string;
    contestType: string;
    submissionOpen: boolean;
    votingOpen: boolean;
    submissionsCount?: number;
  } | null;
  loading: boolean;
  error: string | null;
}
```

### Context: `FarcasterContext`

Provides authenticated Farcaster user data.

**Value:**
```typescript
{
  user: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  } | null;
  isReady: boolean;
}
```

## Future Enhancements

The extension is designed to be extensible. Planned features include:

- **Submission Interface** - Create entries within the MiniApp
- **Voting UI** - Vote on submissions with transaction signing
- **Submission Gallery** - Browse all contest entries
- **Leaderboard** - Real-time vote tallies
- **Notifications** - Alerts for contest phase changes
- **Frame Integration** - Deep links from Farcaster Frames

## Deployment

### Vercel (Recommended)

```bash
cd packages/farcaster-miniapp-extension
vercel
```

### Environment Variables

No environment variables required for basic functionality. The extension uses public RPC endpoints by default.

## Resources

- **JokeRace Extension Docs:** https://docs.jokerace.io/technical-how-tos/building-an-extension
- **Farcaster MiniApp SDK:** https://miniapps.farcaster.xyz/
- **Extension README:** [`/packages/farcaster-miniapp-extension/README.md`](./packages/farcaster-miniapp-extension/README.md)
- **Extension Manifest:** [`/packages/farcaster-miniapp-extension/extension.json`](./packages/farcaster-miniapp-extension/extension.json)

## Contributing

Contributions welcome! The extension is open source under AGPL-3.0-only.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes in `/packages/farcaster-miniapp-extension/`
4. Test thoroughly
5. Submit a pull request

---

*Built as a permissionless JokeRace extension for the Farcaster ecosystem*
