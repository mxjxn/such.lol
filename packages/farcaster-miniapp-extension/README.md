# JokeRace Farcaster Mini App Extension

A JokeRace extension that enables users to view and participate in contests directly from Farcaster Mini Apps.

## Overview

This extension brings JokeRace contests into the Farcaster ecosystem, allowing users to:

- **View Contest Details** - Access full contest information within Farcaster
- **Submit Entries** - Create submissions using your Farcaster identity
- **Vote on Submissions** - Participate in voting without leaving Farcaster
- **Track Progress** - Monitor contest status and results
- **Share Contests** - Easily share with your Farcaster network

## Features

### ✅ Implemented

- **Farcaster Mini App Integration** - Full SDK integration with `@farcaster/miniapp-sdk` (v0.2.1)
- **Contest Viewer** - Display contest details from blockchain
- **Multi-Chain Support** - Ethereum, Base, Optimism, Arbitrum, Polygon
- **User Context** - Automatic Farcaster profile integration
- **Real-time Status** - Live contest phase detection (submission/voting)
- **Direct Blockchain Queries** - No API needed, reads directly from smart contracts
- **Shareable Embeds** - Create interactive cast embeds that deep-link to the Mini App

### 🚧 Future Enhancements

- Submission creation interface
- Voting interface
- Submission browsing
- Vote tallying and leaderboards
- Notifications for contest phases

## Architecture

Built as a standalone Next.js 14 application following JokeRace extension guidelines:

### Technology Stack

- **Next.js 14** - App Router for modern React patterns
- **@farcaster/miniapp-sdk (v0.2.1)** - Official Farcaster Mini App integration
- **Viem** - Lightweight blockchain interaction library
- **TailwindCSS** - Utility-first styling
- **TypeScript** - Type-safe development

### Project Structure

```
src/
├── app/
│   ├── contest/[chain]/[address]/   # Contest viewer page
│   ├── layout.tsx                   # Root layout with metadata
│   ├── page.tsx                     # Home page with URL input
│   ├── providers.tsx                # Farcaster context provider
│   └── globals.css                  # Global styles
├── hooks/
│   └── useContestData.ts            # Blockchain data fetching
└── lib/
    └── (utilities)                  # Helper functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

```bash
cd packages/farcaster-miniapp-extension
npm install
```

### Development

```bash
npm run dev
```

The extension will run on `http://localhost:3001`

### Building

```bash
npm run build
npm start
```

## Usage

### As a Farcaster Mini App

1. Open the extension URL in a Farcaster client that supports Mini Apps
2. Your Farcaster profile will be automatically detected via the SDK
3. Enter a JokeRace contest URL or navigate directly to `/contest/{chain}/{address}`
4. View contest details, submit entries, and vote

### Sharing via Embeds

This extension also provides shareable embed endpoints (using the Farcaster embed protocol) that can be posted in casts. See [EMBEDS.md](./EMBEDS.md) for details.

### URL Format

```
/contest/{chain}/{address}

Examples:
- /contest/base/0x1234567890123456789012345678901234567890
- /contest/ethereum/0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

### Supported Chains

- Ethereum (ethereum, eth)
- Base (base)
- Optimism (optimism, opt)
- Arbitrum (arbitrum, arb)
- Polygon (polygon, matic)

## How It Works

### Blockchain Integration

The extension queries contest data directly from the blockchain using Viem:

1. **Contract Reading** - Fetches contest details from the JokeRace smart contract
2. **Phase Calculation** - Determines current contest phase (submission/voting)
3. **Real-time Updates** - Monitors blockchain state for changes

### Farcaster Integration

Uses the official `@farcaster/miniapp-sdk` to:

1. **Initialize SDK** - Calls `sdk.actions.ready()` on app load
2. **Access User Context** - Retrieves FID, username, display name, and profile picture
3. **Provide Context** - Makes user data available throughout the app via React Context

## JokeRace Extension Compliance

This extension follows the [official JokeRace extension guidelines](https://docs.jokerace.io/technical-how-tos/building-an-extension):

✅ **Standalone Contest Pages** - Each contest has its own dedicated page
✅ **Direct Blockchain Access** - No API dependency, queries blockchain directly
✅ **Multi-Chain Support** - Supports all major EVM chains
✅ **Clear Context** - Provides ample information about how the extension works
✅ **Permissionless** - Can be deployed and used without JokeRace approval
✅ **Deep Linkable** - Direct URLs to specific contests

## API Reference

### Hooks

#### `useContestData(chain: string, address: string)`

Fetches contest data from the blockchain.

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

### Context

#### `FarcasterContext`

Provides Farcaster user context throughout the app.

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

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```bash
docker build -t jokerace-farcaster-miniapp .
docker run -p 3001:3001 jokerace-farcaster-miniapp
```

### Environment Variables

Optional configuration:

```env
# No required environment variables for basic functionality
# Blockchain RPC calls use public endpoints by default
```

## Contributing

This extension is open source and contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Adding Features

Some ideas for contributions:

- Submission creation UI
- Voting interface with transaction signing
- Submission gallery/list view
- Vote leaderboard
- Contest search functionality
- Notification system for contest phases

## License

AGPL-3.0-only

## Resources

- [JokeRace Docs](https://docs.jokerace.io/)
- [Building JokeRace Extensions](https://docs.jokerace.io/technical-how-tos/building-an-extension)
- [Farcaster MiniApp Docs](https://miniapps.farcaster.xyz/)
- [@farcaster/miniapp-sdk](https://www.npmjs.com/package/@farcaster/miniapp-sdk)
- [Viem Documentation](https://viem.sh/)

## Support

For questions or issues:

- GitHub Issues: https://github.com/jk-labs-inc/jokerace/issues
- JokeRace Discord: https://discord.gg/jokerace
- Farcaster: Tag @jokerace

---

Built with ❤️ for the JokeRace and Farcaster communities
