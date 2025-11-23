# Building JokeRace Extensions: Complete Tutorial

A comprehensive guide to understanding and building JokeRace extensions, using the Farcaster MiniApp Extension as a reference implementation.

---

## Table of Contents

1. [What Are JokeRace Extensions?](#what-are-jokerace-extensions)
2. [Extension Architecture](#extension-architecture)
3. [How This Extension Works](#how-this-extension-works)
4. [Blockchain Integration](#blockchain-integration)
5. [Farcaster Integration](#farcaster-integration)
6. [Building Your Own Extension](#building-your-own-extension)
7. [Advanced Topics](#advanced-topics)

---

## What Are JokeRace Extensions?

### Definition

JokeRace extensions are **standalone applications** built on top of JokeRace's blockchain protocol that extend the features and functionality of contests.

### Key Characteristics

- **Permissionless** - Anyone can build one
- **Standalone** - Independent applications, not modifications to JokeRace
- **Blockchain-first** - Read data directly from smart contracts
- **No API dependency** - Query blockchain directly
- **Multi-chain** - Support multiple EVM networks

### Why Build Extensions?

Extensions enable you to:
- Create specialized user experiences
- Integrate with other platforms (like Farcaster)
- Add features JokeRace doesn't provide natively
- Build on existing contest infrastructure
- Tap into JokeRace's community and contests

---

## Extension Architecture

### The JokeRace Stack

```
┌─────────────────────────────────────┐
│     Your Extension (Frontend)       │  ← You build this
├─────────────────────────────────────┤
│    Blockchain (Smart Contracts)     │  ← JokeRace provides this
├─────────────────────────────────────┤
│         EVM Networks (L1/L2)        │  ← Infrastructure
└─────────────────────────────────────┘
```

### How Extensions Work

1. **Smart Contracts Are The API**
   - Each contest is a deployed smart contract
   - Contracts have standardized functions (`name()`, `prompt()`, etc.)
   - Anyone can read from these contracts
   - No central API needed

2. **Direct Blockchain Access**
   ```typescript
   // Instead of: fetch('https://api.jokerace.io/contest/123')
   // You do:
   const name = await client.readContract({
     address: contestAddress,
     abi: CONTEST_ABI,
     functionName: 'name'
   });
   ```

3. **Standalone Pages**
   - Each extension has its own URL structure
   - Deep linkable to specific contests
   - Can be hosted anywhere

4. **No Central Coordination**
   - Build and deploy independently
   - No approval needed from JokeRace
   - Share your extension URL directly

### Extension Requirements

Per [official JokeRace guidelines](https://docs.jokerace.io/technical-how-tos/building-an-extension):

✅ **Standalone contest pages** - Each contest accessible via unique URL
✅ **Direct blockchain access** - Read from contracts directly
✅ **Multi-chain support** - Support major EVM chains
✅ **Clear context** - Explain how the extension works
✅ **Permissionless** - Deployable without JokeRace approval

---

## How This Extension Works

### High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│              Farcaster MiniApp Extension             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Mini App  │  │   Frames   │  │  Blockchain  │  │
│  │    SDK     │  │    API     │  │   Queries    │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
│        ↓               ↓                 ↓          │
│  ┌────────────────────────────────────────────┐    │
│  │         Next.js 14 (App Router)            │    │
│  └────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
         ↓                    ↓                  ↓
   User Context      Shareable Embeds     Contest Data
  (FID, username)    (Interactive Frames)  (On-chain)
```

### Three Main Components

#### 1. **Mini App** - The Application Itself

**Purpose:** Full web app that runs inside Farcaster clients

**Implementation:**
- Next.js 14 application
- Uses `@farcaster/miniapp-sdk`
- Provides user context (FID, username, profile pic)
- Renders contest viewer, voting UI, etc.

**Key Files:**
```
src/app/
├── page.tsx          # Home page (URL input)
├── providers.tsx     # Farcaster SDK initialization
└── contest/          # Contest viewer pages
```

#### 2. **Frames** - Shareable Embeds

**Purpose:** Interactive embeds in Farcaster casts that link to Mini App

**Implementation:**
- API routes that return HTML with Frame meta tags
- Dynamic OG image generation
- Buttons that deep link to Mini App

**Key Files:**
```
src/app/api/
├── frame/           # Frame HTML endpoints
│   ├── contest/     # Contest sharing
│   ├── submission/  # Submission sharing
│   └── vote/        # Voting promotion
└── og/              # OG image generation
```

#### 3. **Blockchain Queries** - Data Layer

**Purpose:** Read contest data directly from smart contracts

**Implementation:**
- Viem for blockchain interactions
- Read-only contract calls
- Multi-chain support

**Key Files:**
```
src/hooks/
└── useContestData.ts  # Custom hook for blockchain queries
```

---

## Blockchain Integration

### Understanding JokeRace Contracts

Every JokeRace contest is a deployed smart contract with a standard interface:

```solidity
interface IJokeRaceContest {
  function name() external view returns (string);
  function prompt() external view returns (string);
  function contestStart() external view returns (uint256);
  function votingDelay() external view returns (uint256);
  function votingPeriod() external view returns (uint256);
  function numSubmissions() external view returns (uint256);
  // ... more functions
}
```

### How We Query Blockchain Data

#### Step 1: Define the ABI

```typescript
// src/hooks/useContestData.ts
const CONTEST_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ... more function definitions
] as const;
```

#### Step 2: Create Public Client

```typescript
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http(), // Uses public RPC
});
```

#### Step 3: Read Contract Data

```typescript
const name = await client.readContract({
  address: '0x123...', // Contest contract address
  abi: CONTEST_ABI,
  functionName: 'name',
});
// Returns: "My Awesome Contest"
```

#### Step 4: Calculate Contest State

```typescript
// Get timestamps
const contestStart = await client.readContract({
  address: contestAddress,
  abi: CONTEST_ABI,
  functionName: 'contestStart',
});

const votingDelay = await client.readContract({
  address: contestAddress,
  abi: CONTEST_ABI,
  functionName: 'votingDelay',
});

// Calculate phases
const now = BigInt(Math.floor(Date.now() / 1000));
const submissionEnd = contestStart + votingDelay;
const submissionOpen = now >= contestStart && now < submissionEnd;
```

### Multi-Chain Support

```typescript
const CHAIN_MAP: Record<string, any> = {
  ethereum: mainnet,
  base: base,
  optimism: optimism,
  arbitrum: arbitrum,
  polygon: polygon,
};

// Dynamic chain selection
const chainConfig = CHAIN_MAP[chainName];
const client = createPublicClient({
  chain: chainConfig,
  transport: http(),
});
```

### Why This Works

1. **Standardized Interface** - All JokeRace contests use the same ABI
2. **Public Data** - Contract reads are free and permissionless
3. **No Central Server** - Query blockchain directly
4. **Always Up-to-Date** - Reading latest on-chain state
5. **Works Forever** - As long as blockchain exists, this works

---

## Farcaster Integration

### Two Integration Layers

#### Layer 1: Mini App SDK

**What:** JavaScript SDK that provides Farcaster context

**Installation:**
```bash
npm install @farcaster/miniapp-sdk
```

**Usage:**
```typescript
import { sdk } from '@farcaster/miniapp-sdk';

// Initialize
await sdk.actions.ready();

// Access user context
const user = sdk.context.user;
// → { fid: 12345, username: 'alice', displayName: 'Alice', pfpUrl: '...' }
```

**Implementation in Extension:**

```typescript
// src/app/providers.tsx
'use client';

import { sdk } from '@farcaster/miniapp-sdk';

export default function Providers({ children }) {
  useEffect(() => {
    const init = async () => {
      await sdk.actions.ready(); // Required!
      const user = sdk.context.user;
      setUser(user);
    };
    init();
  }, []);

  return (
    <FarcasterContext.Provider value={{ user }}>
      {children}
    </FarcasterContext.Provider>
  );
}
```

**What You Get:**
- User's Farcaster ID (FID)
- Username
- Display name
- Profile picture URL
- Automatic authentication

#### Layer 2: Farcaster embeds (Frame protocol)

**What:** Interactive embeds in casts with clickable buttons

**How They Work:**

```
1. You create an HTML page with special meta tags
2. Someone shares the URL in a Farcaster cast
3. Farcaster fetches your page
4. Farcaster parses the meta tags
5. Renders as interactive Frame
6. User clicks button → opens your Mini App
```

**Frame Meta Tags:**

```html
<!-- Required -->
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://your-site.com/image.png" />

<!-- Buttons (up to 4) -->
<meta property="fc:frame:button:1" content="View Contest" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="https://miniapp.com/contest/base/0x123" />
```

**Implementation in Extension:**

```typescript
// src/app/api/frame/contest/[chain]/[address]/route.ts
export async function GET(request, { params }) {
  const { chain, address } = params;

  // Fetch contest data from blockchain
  const name = await readContract(...);

  // Build Frame HTML
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:button:1" content="View Contest" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${miniappUrl}" />
      </head>
      <body>
        <h1>${name}</h1>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
```

### How Mini Apps and Embeds Work Together

```
┌─────────────────────────────────────────────────┐
│           User Journey                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. User sees Frame in Farcaster feed          │
│     [Contest Image]                            │
│     [View Contest] [Submit] [Vote]             │
│                                                 │
│  2. Clicks "Vote" button                       │
│     ↓                                          │
│                                                 │
│  3. Frame deep links to Mini App               │
│     miniapp.com/contest/base/0x123?action=vote │
│     ↓                                          │
│                                                 │
│  4. Mini App opens in Farcaster                │
│     - SDK provides user context                │
│     - User is authenticated                    │
│     - Voting UI displayed                      │
│     ↓                                          │
│                                                 │
│  5. User votes on submissions                  │
│     (All within Farcaster!)                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Deep Linking

**Query Parameters for Actions:**

```typescript
// Frame button links to:
miniapp.com/contest/base/0x123?action=vote

// Mini App detects action:
const { action } = useSearchParams();

if (action === 'vote') {
  // Show voting UI
} else if (action === 'submit') {
  // Show submission UI
}
```

---

## Building Your Own Extension

### Step-by-Step Guide

#### Step 1: Choose Your Tech Stack

**Recommended:**
- Next.js (for SSR and API routes)
- Viem (for blockchain)
- TypeScript (for type safety)

**Alternative:**
- Any web framework
- Any blockchain library
- Just needs to query contracts!

#### Step 2: Set Up Project

```bash
npx create-next-app@latest my-jokerace-extension
cd my-jokerace-extension
npm install viem
```

#### Step 3: Create Contest ABI

```typescript
// lib/abi.ts
export const CONTEST_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Add more functions as needed
] as const;
```

#### Step 4: Build Contest Viewer

```typescript
// app/contest/[chain]/[address]/page.tsx
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { CONTEST_ABI } from '@/lib/abi';

export default async function Contest({ params }) {
  const { chain, address } = params;

  // Create client
  const client = createPublicClient({
    chain: base,
    transport: http(),
  });

  // Read contest data
  const name = await client.readContract({
    address: address as `0x${string}`,
    abi: CONTEST_ABI,
    functionName: 'name',
  });

  return (
    <div>
      <h1>{name}</h1>
      <a href={`https://jokerace.io/contest/${chain}/${address}`}>
        View on JokeRace
      </a>
    </div>
  );
}
```

#### Step 5: Add Multi-Chain Support

```typescript
// lib/chains.ts
import { base, mainnet, optimism } from 'viem/chains';

export const CHAINS = {
  base: base,
  ethereum: mainnet,
  optimism: optimism,
};

// In your component:
const chainConfig = CHAINS[params.chain];
```

#### Step 6: Deploy

```bash
# Deploy to Vercel
vercel

# Your extension is live!
# https://your-extension.vercel.app/contest/base/0x123...
```

#### Step 7: Test with Real Contests

```
Visit https://jokerace.io/
Find any live contest
Copy the chain and address
Test your extension:
https://your-extension.com/contest/base/0x123...
```

### Extension Patterns

#### Pattern 1: Contest Viewer
- Read and display contest details
- Show submissions
- Display voting results

#### Pattern 2: Specialized UI
- Mobile-optimized interface
- Accessibility features
- Custom visualizations

#### Pattern 3: Platform Integration
- Telegram bot
- Discord integration
- Farcaster Mini App (this extension!)

#### Pattern 4: Analytics
- Vote tracking
- Submission analytics
- Participant insights

---

## Advanced Topics

### Handling Contract Versions

JokeRace contracts evolve over time:

```typescript
async function getContestVersion(address: string) {
  try {
    // Try reading version (newer contracts)
    const version = await client.readContract({
      address,
      abi: CONTEST_ABI,
      functionName: 'version',
    });
    return version;
  } catch {
    // Older contracts don't have version
    return 'v3';
  }
}

// Use different ABIs based on version
const abi = version === 'v4' ? CONTEST_ABI_V4 : CONTEST_ABI_V3;
```

### Caching Strategies

```typescript
// API route with caching
export async function GET(request, { params }) {
  const data = await fetchFromBlockchain();

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=300', // 5 minutes
    },
  });
}
```

### Error Handling

```typescript
try {
  const name = await client.readContract({...});
} catch (error) {
  if (error.message.includes('execution reverted')) {
    // Contract doesn't exist or is invalid
    return { error: 'Contest not found' };
  }
  throw error;
}
```

### Performance Optimization

```typescript
// Batch multiple reads
const [name, prompt, submissions] = await Promise.all([
  client.readContract({ functionName: 'name' }),
  client.readContract({ functionName: 'prompt' }),
  client.readContract({ functionName: 'numSubmissions' }),
]);
```

---

## Key Takeaways

1. **Extensions are standalone apps** - Not forks of JokeRace
2. **Blockchain is the API** - Read directly from contracts
3. **Permissionless** - Build and deploy independently
4. **Multi-chain from day one** - Support all EVM networks
5. **No central coordination** - Works as long as blockchain exists
6. **Farcaster integration optional** - But powerful for social features

---

## Resources

- **JokeRace Extension Docs:** https://docs.jokerace.io/technical-how-tos/building-an-extension
- **Viem Documentation:** https://viem.sh/
- **Farcaster Mini Apps:** https://miniapps.farcaster.xyz/
- **This Extension's Code:** `/packages/farcaster-miniapp-extension/`

---

## Next Steps

1. **Explore the Code**
   - Study `/src/hooks/useContestData.ts` for blockchain queries
   - Check `/src/app/api/frame/` for Frame implementation
   - Review `/src/app/providers.tsx` for Farcaster SDK usage

2. **Build Your Extension**
   - Start with a simple contest viewer
   - Add unique features (analytics, custom UI, etc.)
   - Deploy and share!

3. **Join the Community**
   - Share your extension on Farcaster
   - Tag @jokerace
   - Help others build extensions

---

**Happy Building! 🚀**

*This tutorial demonstrates that building on JokeRace is permissionless, accessible, and powerful. The blockchain is your API!*
