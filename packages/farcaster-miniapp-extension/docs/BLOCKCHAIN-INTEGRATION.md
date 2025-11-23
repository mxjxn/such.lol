# Blockchain Integration Guide

A comprehensive guide to understanding how this extension queries JokeRace smart contracts directly.

---

## Table of Contents

1. [Why Direct Blockchain Access?](#why-direct-blockchain-access)
2. [Understanding JokeRace Contracts](#understanding-jokerace-contracts)
3. [Setting Up Viem](#setting-up-viem)
4. [Reading Contract Data](#reading-contract-data)
5. [Multi-Chain Support](#multi-chain-support)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Why Direct Blockchain Access?

### The Traditional Approach (Not Used Here)

```
Extension → API Server → Database → Blockchain
```

**Problems:**
- Central point of failure
- Sync lag between DB and blockchain
- Requires trust in API provider
- Additional infrastructure costs
- Rate limiting from API

### The Extension Approach (What We Do)

```
Extension → Blockchain RPC
```

**Benefits:**
- ✅ No central server needed
- ✅ Always up-to-date (reading latest state)
- ✅ Permissionless (anyone can query)
- ✅ Trustless (verify data yourself)
- ✅ Works forever (as long as blockchain exists)

---

## Understanding JokeRace Contracts

### What is a JokeRace Contest?

Each contest is a **deployed smart contract** on an EVM blockchain.

**Contract Address Example:**
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (on Base chain)
```

**How to Find Contests:**
1. Visit https://jokerace.io/
2. Browse contests
3. Look at URL: `jokerace.io/contest/{chain}/{address}`
4. The `address` is the contract address!

### Contract Interface

All JokeRace contests implement a standard interface:

```solidity
// Simplified JokeRace Contest Interface
interface IJokeRaceContest {
  // Metadata
  function name() external view returns (string memory);
  function prompt() external view returns (string memory);

  // Timing
  function contestStart() external view returns (uint256);
  function votingDelay() external view returns (uint256);
  function votingPeriod() external view returns (uint256);

  // Submissions
  function numSubmissions() external view returns (uint256);
  function proposalAddresses(uint256 proposalId) external view returns (address);

  // State
  function state() external view returns (uint8);

  // And many more functions...
}
```

### Key Functions Explained

#### `name()` - Contest Name
```solidity
function name() external view returns (string memory);
```
Returns the contest name, e.g., "Best Meme Contest"

#### `prompt()` - Contest Details
```solidity
function prompt() external view returns (string memory);
```
Returns contest prompt in format: `title|author|description`

Example: `Best Meme|alice|Share your funniest meme!`

#### `contestStart()` - Start Timestamp
```solidity
function contestStart() external view returns (uint256);
```
Returns Unix timestamp when contest begins

#### `votingDelay()` - Submission Period Length
```solidity
function votingDelay() external view returns (uint256);
```
Returns duration in seconds for submission period

#### `votingPeriod()` - Voting Period Length
```solidity
function votingPeriod() external view returns (uint256);
```
Returns duration in seconds for voting period

#### `numSubmissions()` - Submission Count
```solidity
function numSubmissions() external view returns (uint256);
```
Returns total number of submissions

### Contest Phases

```
Timeline:
├─────────────┼─────────────┼─────────────┤
│ Not Started │ Submission  │   Voting    │
│             │   Period    │   Period    │
└─────────────┴─────────────┴─────────────┘
     ↑              ↑              ↑
contestStart   +votingDelay  +votingPeriod
```

**Calculating Current Phase:**
```typescript
const now = BigInt(Math.floor(Date.now() / 1000));
const submissionEnd = contestStart + votingDelay;
const votingEnd = submissionEnd + votingPeriod;

const notStarted = now < contestStart;
const submissionOpen = now >= contestStart && now < submissionEnd;
const votingOpen = now >= submissionEnd && now < votingEnd;
const ended = now >= votingEnd;
```

---

## Setting Up Viem

### Why Viem?

**Viem vs Ethers.js:**
- Smaller bundle size (~40% smaller)
- Better TypeScript support
- Modern, tree-shakeable API
- Excellent documentation
- Active development

### Installation

```bash
npm install viem
```

### Basic Setup

```typescript
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Create a public client (read-only)
const client = createPublicClient({
  chain: base,
  transport: http(), // Uses public RPC by default
});
```

### With Custom RPC

```typescript
const client = createPublicClient({
  chain: base,
  transport: http('https://base-mainnet.g.alchemy.com/v2/YOUR_KEY'),
});
```

### Using Environment Variables

```typescript
const getRpcUrl = (chain: string) => {
  const envVar = `RPC_URL_${chain.toUpperCase()}`;
  return process.env[envVar] || undefined;
};

const client = createPublicClient({
  chain: base,
  transport: http(getRpcUrl('base')),
});
```

---

## Reading Contract Data

### Define the ABI

**What is an ABI?**
Application Binary Interface - tells your code how to interact with the contract.

```typescript
const CONTEST_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'prompt',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ... more functions
] as const;  // ← Important for TypeScript!
```

**Minimal ABI:**
You only need to define functions you'll actually call!

### Read a Single Value

```typescript
const name = await client.readContract({
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  abi: CONTEST_ABI,
  functionName: 'name',
});

console.log(name); // "Best Meme Contest"
```

### Read Multiple Values (Sequential)

```typescript
const name = await client.readContract({
  address: contestAddress,
  abi: CONTEST_ABI,
  functionName: 'name',
});

const prompt = await client.readContract({
  address: contestAddress,
  abi: CONTEST_ABI,
  functionName: 'prompt',
});
```

❌ **Slow** - Makes 2 separate network requests

### Read Multiple Values (Parallel)

```typescript
const [name, prompt, start] = await Promise.all([
  client.readContract({
    address: contestAddress,
    abi: CONTEST_ABI,
    functionName: 'name',
  }),
  client.readContract({
    address: contestAddress,
    abi: CONTEST_ABI,
    functionName: 'prompt',
  }),
  client.readContract({
    address: contestAddress,
    abi: CONTEST_ABI,
    functionName: 'contestStart',
  }),
]);
```

✅ **Fast** - Makes 3 requests in parallel

### Read with Multicall (Advanced)

```typescript
import { readContracts } from 'viem/actions';

const results = await readContracts(client, {
  contracts: [
    {
      address: contestAddress,
      abi: CONTEST_ABI,
      functionName: 'name',
    },
    {
      address: contestAddress,
      abi: CONTEST_ABI,
      functionName: 'prompt',
    },
  ],
});

const [name, prompt] = results.map(r => r.result);
```

✅✅ **Fastest** - Batches into single RPC call (if RPC supports it)

### Type Safety

```typescript
// ✅ Type-safe with 'as const'
const CONTEST_ABI = [...] as const;

const name = await client.readContract({
  address: contestAddress,
  abi: CONTEST_ABI,
  functionName: 'name',  // ← Autocomplete!
});
// name is typed as 'string'

// ❌ Without 'as const'
const CONTEST_ABI = [...];  // Missing 'as const'
// functionName won't autocomplete
// Return type is 'unknown'
```

---

## Multi-Chain Support

### Chain Configuration

```typescript
import { base, mainnet, optimism, arbitrum, polygon } from 'viem/chains';

const CHAIN_MAP: Record<string, Chain> = {
  ethereum: mainnet,
  base: base,
  optimism: optimism,
  arbitrum: arbitrum,
  polygon: polygon,
};
```

### Dynamic Chain Selection

```typescript
function createClientForChain(chainName: string) {
  const chainConfig = CHAIN_MAP[chainName.toLowerCase()];

  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chainName}`);
  }

  return createPublicClient({
    chain: chainConfig,
    transport: http(),
  });
}

// Usage
const client = createClientForChain('base');
```

### Chain-Specific RPC URLs

```typescript
const RPC_URLS: Record<string, string> = {
  ethereum: process.env.RPC_URL_ETH || 'https://eth.llamarpc.com',
  base: process.env.RPC_URL_BASE || 'https://mainnet.base.org',
  optimism: process.env.RPC_URL_OP || 'https://mainnet.optimism.io',
};

function createClientForChain(chainName: string) {
  const chainConfig = CHAIN_MAP[chainName];
  const rpcUrl = RPC_URLS[chainName];

  return createPublicClient({
    chain: chainConfig,
    transport: http(rpcUrl),
  });
}
```

### Custom Chain (e.g., Degen L3)

```typescript
import { defineChain } from 'viem';

const degen = defineChain({
  id: 666666666,
  name: 'Degen',
  network: 'degen',
  nativeCurrency: {
    decimals: 18,
    name: 'Degen',
    symbol: 'DEGEN',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.degen.tips'],
    },
    public: {
      http: ['https://rpc.degen.tips'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Degen Explorer',
      url: 'https://explorer.degen.tips',
    },
  },
});

// Add to CHAIN_MAP
const CHAIN_MAP = {
  ...existing,
  degen: degen,
};
```

---

## Common Patterns

### Pattern 1: Contest Viewer

```typescript
async function getContestData(chain: string, address: string) {
  const client = createClientForChain(chain);

  const [name, prompt, start, delay, period, numSubs] = await Promise.all([
    client.readContract({ address, abi: CONTEST_ABI, functionName: 'name' }),
    client.readContract({ address, abi: CONTEST_ABI, functionName: 'prompt' }),
    client.readContract({ address, abi: CONTEST_ABI, functionName: 'contestStart' }),
    client.readContract({ address, abi: CONTEST_ABI, functionName: 'votingDelay' }),
    client.readContract({ address, abi: CONTEST_ABI, functionName: 'votingPeriod' }),
    client.readContract({ address, abi: CONTEST_ABI, functionName: 'numSubmissions' }),
  ]);

  // Calculate phases
  const now = BigInt(Math.floor(Date.now() / 1000));
  const submissionEnd = start + delay;
  const votingEnd = submissionEnd + period;

  return {
    name,
    prompt,
    submissionOpen: now >= start && now < submissionEnd,
    votingOpen: now >= submissionEnd && now < votingEnd,
    submissionsCount: Number(numSubs),
  };
}
```

### Pattern 2: React Hook

```typescript
import { useState, useEffect } from 'react';

function useContestData(chain: string, address: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const contestData = await getContestData(chain, address);
        setData(contestData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [chain, address]);

  return { data, loading, error };
}
```

### Pattern 3: Error Handling

```typescript
async function safeReadContract(params) {
  try {
    return await client.readContract(params);
  } catch (error) {
    if (error.message.includes('execution reverted')) {
      // Contract doesn't exist or function not available
      return null;
    }
    if (error.message.includes('rate limit')) {
      // RPC rate limited - wait and retry
      await sleep(1000);
      return safeReadContract(params);
    }
    // Unknown error - rethrow
    throw error;
  }
}
```

### Pattern 4: Fallback Values

```typescript
const numSubmissions = await client
  .readContract({
    address: contestAddress,
    abi: CONTEST_ABI,
    functionName: 'numSubmissions',
  })
  .catch(() => 0n); // Default to 0 if function doesn't exist
```

---

## Troubleshooting

### Issue: "execution reverted"

**Cause:** Contract doesn't exist at that address or chain

**Solution:**
```typescript
// Verify contract exists
const code = await client.getBytecode({
  address: contestAddress,
});

if (!code || code === '0x') {
  throw new Error('No contract at this address');
}
```

### Issue: "rate limit exceeded"

**Cause:** Too many requests to public RPC

**Solutions:**
1. Use dedicated RPC provider
2. Add caching layer
3. Implement retry logic

```typescript
async function readWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.readContract(params);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(2 ** i * 1000); // Exponential backoff
    }
  }
}
```

### Issue: "Invalid address"

**Cause:** Address not properly formatted

**Solution:**
```typescript
import { isAddress } from 'viem';

if (!isAddress(address)) {
  throw new Error('Invalid Ethereum address');
}
```

### Issue: Slow queries

**Causes:**
- Sequential requests
- Slow RPC
- Network latency

**Solutions:**
1. Use `Promise.all()` for parallel requests
2. Use multicall for batching
3. Add caching layer
4. Use faster RPC provider

```typescript
// ❌ Slow
const a = await read({ functionName: 'a' });
const b = await read({ functionName: 'b' });

// ✅ Fast
const [a, b] = await Promise.all([
  read({ functionName: 'a' }),
  read({ functionName: 'b' }),
]);
```

### Issue: TypeScript errors

**Cause:** ABI not using `as const`

**Solution:**
```typescript
// ❌ Wrong
const ABI = [{ name: 'foo', ... }];

// ✅ Correct
const ABI = [{ name: 'foo', ... }] as const;
```

---

## Best Practices

### 1. Always Use Parallel Requests

```typescript
// ✅ Good
const [name, prompt] = await Promise.all([
  readName(),
  readPrompt(),
]);

// ❌ Bad
const name = await readName();
const prompt = await readPrompt();
```

### 2. Handle Errors Gracefully

```typescript
const numSubmissions = await client
  .readContract({ functionName: 'numSubmissions' })
  .catch(err => {
    console.error('Failed to read submissions:', err);
    return 0n; // Fallback value
  });
```

### 3. Cache Blockchain Reads

```typescript
const cache = new Map();

async function cachedRead(key, readFn) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = await readFn();
  cache.set(key, result);

  // Expire after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);

  return result;
}
```

### 4. Validate Inputs

```typescript
import { isAddress } from 'viem';

function validateContestParams(chain: string, address: string) {
  if (!CHAIN_MAP[chain]) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  if (!isAddress(address)) {
    throw new Error(`Invalid address: ${address}`);
  }
}
```

### 5. Use Minimal ABIs

```typescript
// ❌ Don't include entire contract ABI (hundreds of functions)
import FULL_ABI from './contest-full-abi.json';

// ✅ Only include functions you use
const MINIMAL_ABI = [
  { name: 'name', outputs: [{ type: 'string' }], ... },
  { name: 'prompt', outputs: [{ type: 'string' }], ... },
] as const;
```

---

## Advanced Topics

### Reading Historical Data

```typescript
// Read at specific block
const name = await client.readContract({
  address: contestAddress,
  abi: CONTEST_ABI,
  functionName: 'name',
  blockNumber: 12345678n,
});
```

### Event Listening (Future Enhancement)

```typescript
// Watch for new submissions
const unwatch = client.watchContractEvent({
  address: contestAddress,
  abi: CONTEST_ABI,
  eventName: 'ProposalCreated',
  onLogs: (logs) => {
    console.log('New submission!', logs);
  },
});
```

### Gas Estimation (If Adding Writes)

```typescript
const gas = await client.estimateContractGas({
  address: contestAddress,
  abi: CONTEST_ABI,
  functionName: 'submitProposal',
  args: ['My submission'],
  account: userAddress,
});
```

---

## Summary

### Key Takeaways

1. **Direct blockchain access is powerful** - No central API needed
2. **Viem makes it easy** - Modern, type-safe blockchain library
3. **Parallel requests are crucial** - Always use `Promise.all()`
4. **Error handling matters** - Blockchain calls can fail
5. **Caching improves UX** - Reduce redundant queries

### This Enables

- ✅ Permissionless extensions
- ✅ Always up-to-date data
- ✅ No central point of failure
- ✅ Trustless verification
- ✅ Works forever (as long as blockchain exists)

### The blockchain IS the API!

---

## Resources

- **Viem Docs:** https://viem.sh/
- **JokeRace Contracts:** https://github.com/jk-labs-inc/jokerace
- **EVM Chains:** https://chainlist.org/
- **RPC Providers:** Alchemy, Infura, QuickNode, Ankr

---

*This is the power of building on public blockchains - anyone can read, anyone can build, no permission needed!*
