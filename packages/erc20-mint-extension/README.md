# ERC-20 Mint Extension

A JokeRace extension that mints winning submissions as ERC-20 tokens on Base using the [Clanker SDK](https://github.com/clanker-devco/clanker-sdk).

## Overview

This extension allows you to:
- View the winning submission from any completed JokeRace contest
- Mint the winning submission as an ERC-20 token on the Base blockchain
- Automatically deploy tokens with liquidity on Uniswap V4

## Features

- **Automatic Winner Detection**: Fetches and identifies the winning submission from any JokeRace contest
- **ERC-20 Token Minting**: Uses Clanker SDK to deploy tokens on Base
- **Instant Liquidity**: Tokens are automatically paired with WETH on Uniswap V4
- **Customizable Tokens**: Configure token name, symbol, and image
- **Base Blockchain**: All tokens are deployed on Base for low fees and fast transactions

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Clanker SDK**: Token deployment on Base
- **Viem**: Ethereum interaction library
- **TailwindCSS**: Styling

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Add your private key to `.env`:
```env
PRIVATE_KEY=your_private_key_here
```

**IMPORTANT**: Never commit your `.env` file or share your private key!

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

## Usage

1. **Enter Contest URL**: Paste a JokeRace contest URL (e.g., `https://jokerace.io/contest/base/0x...`)

2. **View Winner**: The extension will fetch the contest data and display the winning submission

3. **Configure Token**: Customize the token name, symbol, and optional image URL

4. **Mint Token**: Click "Mint ERC-20 Token on Base" to deploy your token

5. **Token Deployed**: Receive your token address and view it on BaseScan

## Token Details

Tokens minted through this extension have the following characteristics:

- **Total Supply**: 100 billion tokens (non-mintable)
- **Blockchain**: Base
- **Liquidity**: Automatically paired with WETH on Uniswap V4
- **Initial Market Cap**: ~10 ETH
- **Creator Reward**: 5% of supply goes to the submission creator

## API Endpoints

### GET /api/mint

Returns information about the minting API.

### POST /api/mint

Mints a new ERC-20 token.

**Request Body**:
```json
{
  "name": "Token Name",
  "symbol": "SYMBOL",
  "image": "https://...",
  "description": "Token description",
  "contestAddress": "0x...",
  "chain": "base",
  "submissionId": "0",
  "creator": "0x..."
}
```

**Response**:
```json
{
  "success": true,
  "tokenAddress": "0x...",
  "transactionHash": "0x..."
}
```

## Architecture

```
packages/erc20-mint-extension/
├── src/
│   ├── app/
│   │   ├── api/mint/          # Token minting API endpoint
│   │   ├── contest/[chain]/[address]/  # Contest viewer page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── hooks/
│   │   └── useWinningSubmission.ts  # Hook to fetch winner
│   ├── lib/
│   │   ├── chains.ts          # Chain configuration
│   │   └── contracts.ts       # Contract ABIs and RPC URLs
│   └── types/
│       └── index.ts           # TypeScript types
├── extension.json             # Extension manifest
├── package.json
└── README.md
```

## How It Works

1. **Contest Data Fetching**: The extension uses Viem to read contest data directly from the JokeRace smart contract on-chain

2. **Winner Detection**: It fetches all submissions and identifies the one with the most votes

3. **Token Deployment**: When you click "Mint", the extension calls the Clanker SDK which:
   - Creates a new ERC-20 token contract on Base
   - Mints 100 billion tokens
   - Pairs the entire supply with WETH on Uniswap V4
   - Provides instant liquidity

4. **Result**: You receive the deployed token address and can view it on BaseScan

## Requirements

- Node.js 18+
- A wallet with Base ETH for gas fees
- Private key with sufficient ETH on Base

## Security Notes

- **Private Key Security**: Never expose your private key. Use a dedicated deployment wallet with minimal funds.
- **Environment Variables**: Always use `.env` for sensitive data and never commit it to git
- **Gas Fees**: Ensure your deployment wallet has enough ETH on Base for gas fees

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the `PRIVATE_KEY` environment variable
4. Deploy

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Next.js.

## Links

- [Clanker SDK GitHub](https://github.com/clanker-devco/clanker-sdk)
- [Clanker Documentation](https://clanker.gitbook.io/clanker-documentation)
- [Base Documentation](https://docs.base.org)
- [JokeRace](https://jokerace.io)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
