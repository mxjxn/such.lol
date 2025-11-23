# JokeRace Winner NFT Minting Extension

Mint winning JokeRace contest submissions as 1/1 NFTs using Manifold Creator Core contracts.

## Overview

This extension enables contest creators to immortalize winning submissions as NFTs. Each winner receives a unique 1/1 NFT containing their submission content, ranking, and metadata.

## Features

- ✅ **Manifold Integration** - Uses battle-tested Manifold Creator Core contracts
- ✅ **1/1 NFT Minting** - Each winner gets a unique NFT of their submission
- ✅ **Multi-Chain Support** - Ethereum, Base, Optimism, Arbitrum, Polygon
- ✅ **Batch Minting** - Mint multiple winners in one transaction
- ✅ **Rich Metadata** - Includes ranking, submission content, and author info
- ✅ **Permission-Based** - Only creator contract admins can authorize and mint
- ✅ **Duplicate Protection** - Can't mint the same ranking twice

## Architecture

### Smart Contract Layer

**WinnerMinter.sol** - Manifold Creator Extension
- Integrates with JokeRace contest contracts
- Reads winner rankings from `sortedRanks` array
- Mints 1/1 NFTs via Manifold Creator Core
- Stores rich metadata on-chain

**Key Functions:**
- `authorizeContest(creatorContract, contestAddress, maxWinners)` - Enable minting for a contest
- `mintWinner(creatorContract, contestAddress, ranking)` - Mint a single winner
- `mintWinnersBatch(creatorContract, contestAddress, rankings[])` - Mint multiple winners
- `tokenURI(creatorContract, tokenId)` - Returns JSON metadata for NFT

### Frontend Layer

**Next.js 14 Application** (Port 3002)
- Modern React with App Router
- Wagmi + RainbowKit for wallet connection
- TailwindCSS for styling
- Real-time blockchain queries

**Components:**
- `ContestInput` - Configure contest and creator contract
- `WinnerList` - Display ranked winners from contest
- `MintingInterface` - Authorize and mint NFTs

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
- Metamask or compatible wallet
- Manifold Creator Contract (create one at [studio.manifold.xyz](https://studio.manifold.xyz/))

### Installation

```bash
cd packages/nft-winner-minting
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get a WalletConnect Project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com/)

### Development

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

### Building

```bash
npm run build
npm start
```

## Usage

### Step 1: Deploy WinnerMinter Contract

Deploy `src/contracts/WinnerMinter.sol` to your desired chain(s):

```bash
# Using Foundry
forge create --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY> \
  src/contracts/WinnerMinter.sol:WinnerMinter

# Using Hardhat
npx hardhat run scripts/deploy.js --network <network>
```

Update deployment addresses in `src/lib/contracts.ts`:

```typescript
export const WINNER_MINTER_ADDRESSES: Record<string, Address> = {
  base: '0xYourDeployedAddress',
  // ... other chains
};
```

### Step 2: Create or Use Manifold Creator Contract

Option A: Create new contract at [studio.manifold.xyz](https://studio.manifold.xyz/)
Option B: Use existing Manifold Creator contract address

### Step 3: Configure Contest

1. Connect your wallet (must be admin of creator contract)
2. Select chain where contest is deployed
3. Enter contest contract address
4. Enter your Manifold creator contract address

### Step 4: Authorize Contest

1. Set max number of winners to allow minting
2. Click "Authorize Contest"
3. Confirm transaction in wallet

### Step 5: Mint Winners

1. Select which rankings to mint (e.g., #1, #2, #3)
2. Click "Mint Winners as NFTs"
3. Confirm transaction
4. Winners receive their NFTs!

## How It Works

### Contest → Winners Flow

```
JokeRace Contest
    ↓
sortedRanks array (vote counts in descending order)
    ↓
WinnerMinter reads rankings
    ↓
Fetches proposal data for each ranking
    ↓
Mints 1/1 NFT to winner's address
    ↓
Stores metadata on-chain
```

### NFT Metadata Structure

```json
{
  "name": "Winner #1",
  "description": "[Submission content]",
  "attributes": [
    {
      "trait_type": "Ranking",
      "value": "1"
    },
    {
      "trait_type": "Contest",
      "value": "0x..."
    },
    {
      "trait_type": "Original Author",
      "value": "0x..."
    }
  ]
}
```

## Smart Contract Reference

### WinnerMinter

#### Events

```solidity
event ContestAuthorized(
    address indexed creatorContract,
    address indexed contestAddress,
    uint256 maxWinners
);

event WinnerMinted(
    address indexed creatorContract,
    address indexed contestAddress,
    uint256 indexed tokenId,
    uint256 ranking,
    uint256 proposalId,
    address author
);
```

#### View Functions

```solidity
// Check if contest is authorized
function authorizedContests(address creatorContract, address contestAddress)
    returns (bool);

// Get max winners for contest
function maxWinners(address creatorContract, address contestAddress)
    returns (uint256);

// Get token ID for a ranking (0 if not minted)
function rankingToTokenId(
    address creatorContract,
    address contestAddress,
    uint256 ranking
) returns (uint256);

// Get metadata for token
function tokenMetadata(address creatorContract, uint256 tokenId)
    returns (TokenMetadata);
```

#### Write Functions

```solidity
// Authorize contest (creator admin only)
function authorizeContest(
    address creatorContract,
    address contestAddress,
    uint256 _maxWinners
);

// Mint single winner (creator admin only)
function mintWinner(
    address creatorContract,
    address contestAddress,
    uint256 ranking
) returns (uint256 tokenId);

// Mint multiple winners (creator admin only)
function mintWinnersBatch(
    address creatorContract,
    address contestAddress,
    uint256[] calldata rankings
) returns (uint256[] memory tokenIds);
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```bash
docker build -t jokerace-nft-minting .
docker run -p 3002:3002 jokerace-nft-minting
```

### Environment for Production

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Security Considerations

1. **Admin-Only Minting** - Only Manifold creator contract admins can authorize contests and mint NFTs
2. **Duplicate Protection** - Rankings can only be minted once
3. **Contest Validation** - Contest must be authorized before any minting
4. **Max Winners Cap** - Prevents accidental over-minting

## Limitations & Future Improvements

### Current Limitations

- Simplified ranking-to-proposal mapping (production needs better logic for ties)
- Basic metadata (could add images, external URLs)
- No IPFS integration (metadata stored as data URIs)
- Limited to top 10 winners in UI display

### Planned Improvements

- [ ] Handle tied rankings properly
- [ ] IPFS metadata storage
- [ ] Custom NFT image generation
- [ ] Rarity traits based on vote counts
- [ ] Airdrop to all winners at once
- [ ] Support for semi-fungible tokens (ERC1155)
- [ ] Integration with OpenSea metadata standards
- [ ] Gasless minting via relayer

## Technology Stack

- **Smart Contracts**: Solidity 0.8.19
- **NFT Standard**: ERC721 via Manifold Creator Core
- **Frontend**: Next.js 14, React 18
- **Wallet**: Wagmi 2.x, RainbowKit 2.x
- **Blockchain**: Viem 2.x
- **Styling**: TailwindCSS 3.x
- **TypeScript**: 5.x

## Resources

- **Manifold Docs**: [docs.manifold.xyz](https://docs.manifold.xyz/)
- **Manifold Studio**: [studio.manifold.xyz](https://studio.manifold.xyz/)
- **JokeRace Docs**: [docs.jokerace.io](https://docs.jokerace.io/)
- **Creator Core Contracts**: [github.com/manifoldxyz/creator-core-solidity](https://github.com/manifoldxyz/creator-core-solidity)

## Contributing

Contributions welcome! Key areas:

- Improved ranking-to-proposal mapping logic
- IPFS integration
- Custom NFT artwork generation
- Gas optimizations
- Multi-signature support for authorization

## License

AGPL-3.0-only

## Support

- GitHub Issues: [github.com/jk-labs-inc/jokerace/issues](https://github.com/jk-labs-inc/jokerace/issues)
- JokeRace Discord: [discord.gg/jokerace](https://discord.gg/jokerace)

---

Built with ❤️ for the JokeRace community

**Sources:**
- [Manifold Creator | Manifold Developer Guide](https://docs.manifold.xyz/manifold-for-developers/smart-contracts/manifold-creator)
- [GitHub - manifoldxyz/creator-core-solidity](https://github.com/manifoldxyz/creator-core-solidity)
- [@manifoldxyz/creator-core-solidity - npm](https://www.npmjs.com/package/@manifoldxyz/creator-core-solidity)
