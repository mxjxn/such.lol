# Extension Architecture Deep Dive

A detailed technical explanation of how the JokeRace Farcaster MiniApp Extension is architected.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Home      │  │   Contest    │  │   Submission     │  │
│  │   Page      │  │   Viewer     │  │   Detail         │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Farcaster  │  │    Frame     │  │   Blockchain    │  │
│  │   Context   │  │   Endpoints  │  │     Hooks       │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Farcaster  │  │    Image     │  │   Smart         │  │
│  │     SDK     │  │  Generation  │  │   Contracts     │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
packages/farcaster-miniapp-extension/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API Routes
│   │   │   ├── frame/             # Frame HTML endpoints
│   │   │   │   ├── contest/
│   │   │   │   │   └── [chain]/[address]/route.ts
│   │   │   │   ├── submission/
│   │   │   │   │   └── [chain]/[address]/[id]/route.ts
│   │   │   │   └── vote/
│   │   │   │       └── [chain]/[address]/route.ts
│   │   │   └── og/                # OG Image generation
│   │   │       ├── contest/
│   │   │       │   └── [chain]/[address]/route.tsx
│   │   │       └── submission/
│   │   │           └── [chain]/[address]/[id]/route.tsx
│   │   ├── contest/                # Contest pages
│   │   │   └── [chain]/[address]/
│   │   │       ├── page.tsx       # Contest viewer
│   │   │       └── submission/
│   │   │           └── [id]/
│   │   │               └── page.tsx  # Submission detail
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── providers.tsx           # Context providers
│   │   └── globals.css             # Global styles
│   ├── hooks/                      # Custom React hooks
│   │   └── useContestData.ts      # Blockchain data hook
│   └── lib/                        # Utilities (future)
├── docs/                           # Documentation
│   ├── TUTORIAL.md                # This tutorial
│   └── ARCHITECTURE.md            # This file
├── public/                         # Static assets
├── extension.json                  # Extension manifest
├── FRAMES.md                       # Frame API docs
├── README.md                       # Project readme
└── package.json                    # Dependencies
```

---

## Component Architecture

### 1. Farcaster Provider (`src/app/providers.tsx`)

**Purpose:** Initialize Farcaster Mini App SDK and provide user context

**Responsibilities:**
- Initialize SDK with `sdk.actions.ready()`
- Extract user context from `sdk.context.user`
- Provide context via React Context API
- Handle SDK initialization errors

**Data Flow:**
```
App loads
  ↓
Provider mounts
  ↓
SDK initializes (sdk.actions.ready())
  ↓
User context extracted (sdk.context.user)
  ↓
Context provided to all children
  ↓
Components access via useContext(FarcasterContext)
```

**Code Pattern:**
```typescript
const Providers = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await sdk.actions.ready();  // CRITICAL!
      setUser(sdk.context.user);
      setIsReady(true);
    };
    init();
  }, []);

  return (
    <FarcasterContext.Provider value={{ user, isReady }}>
      {children}
    </FarcasterContext.Provider>
  );
};
```

**Why This Pattern:**
- Centralized SDK initialization
- Single source of truth for user data
- Reusable across all components
- Handles loading states

---

### 2. Contest Data Hook (`src/hooks/useContestData.ts`)

**Purpose:** Fetch and manage contest data from blockchain

**Responsibilities:**
- Create blockchain client for specified chain
- Read contest data from smart contract
- Calculate contest phase (submission/voting)
- Handle errors gracefully
- Provide loading states

**Data Flow:**
```
Component calls useContestData(chain, address)
  ↓
Hook creates Viem client for chain
  ↓
Reads contract functions in parallel
  ↓
Calculates derived state (phases, etc.)
  ↓
Returns { contest, loading, error }
  ↓
Component renders with data
```

**Code Pattern:**
```typescript
export function useContestData(chain: string, address: string) {
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      // 1. Get chain config
      const chainConfig = CHAIN_MAP[chain];

      // 2. Create client
      const client = createPublicClient({
        chain: chainConfig,
        transport: http(),
      });

      // 3. Read contract (parallel)
      const [name, prompt, start, delay, period] =
        await Promise.all([
          client.readContract({ functionName: 'name' }),
          client.readContract({ functionName: 'prompt' }),
          client.readContract({ functionName: 'contestStart' }),
          client.readContract({ functionName: 'votingDelay' }),
          client.readContract({ functionName: 'votingPeriod' }),
        ]);

      // 4. Calculate derived state
      const now = BigInt(Date.now() / 1000);
      const submissionEnd = start + delay;
      const submissionOpen = now >= start && now < submissionEnd;

      // 5. Set state
      setContest({ name, prompt, submissionOpen, ... });
      setLoading(false);
    };

    fetch().catch(err => setError(err));
  }, [chain, address]);

  return { contest, loading, error };
}
```

**Why This Pattern:**
- Encapsulates blockchain complexity
- Reusable across pages
- Handles async state properly
- Provides consistent error handling

---

### 3. Frame Endpoints (`src/app/api/frame/*`)

**Purpose:** Generate Farcaster Frame HTML for sharing

**Responsibilities:**
- Accept dynamic route parameters
- Query blockchain for contest data
- Generate Frame-compliant HTML
- Return proper headers
- Handle errors gracefully

**Request Flow:**
```
User shares Frame URL on Farcaster
  ↓
Farcaster fetches URL
  ↓
Next.js API route handler executes
  ↓
Queries blockchain for data
  ↓
Builds HTML with Frame meta tags
  ↓
Returns HTML response
  ↓
Farcaster parses meta tags
  ↓
Renders Frame in cast
```

**Code Pattern:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { chain, address } = await params;

  // 1. Query blockchain
  const client = createPublicClient({ chain: CHAINS[chain] });
  const name = await client.readContract({ ... });

  // 2. Build URLs
  const frameImage = `${baseUrl}/api/og/contest/${chain}/${address}`;
  const miniappUrl = `${baseUrl}/contest/${chain}/${address}`;

  // 3. Generate HTML
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${frameImage}" />
        <meta property="fc:frame:button:1" content="View Contest" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${miniappUrl}" />
      </head>
      <body>${name}</body>
    </html>
  `;

  // 4. Return with caching
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
```

**Why This Pattern:**
- Server-side rendering for meta tags
- Dynamic data from blockchain
- Cacheable responses
- Standards-compliant Frames

---

### 4. OG Image Generation (`src/app/api/og/*`)

**Purpose:** Generate dynamic Open Graph images for Frames

**Responsibilities:**
- Query blockchain for content
- Generate 1200×630 images
- Use Next.js ImageResponse API
- Return optimized PNG
- Handle errors with fallback images

**Generation Flow:**
```
Frame endpoint references OG image URL
  ↓
Farcaster fetches image URL
  ↓
Next.js ImageResponse API executes
  ↓
Queries blockchain for data
  ↓
Renders JSX to image
  ↓
Returns PNG binary
  ↓
Farcaster displays in Frame
```

**Code Pattern:**
```typescript
import { ImageResponse } from 'next/og';

export async function GET(req, { params }) {
  const { chain, address } = await params;

  // Query blockchain
  const name = await readContract({ ... });

  // Render JSX as image
  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(...)',
      }}>
        <div style={{ fontSize: 56 }}>{name}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

**Why This Pattern:**
- Dynamic images without storage
- No image hosting needed
- Always up-to-date with blockchain
- Farcaster Frame spec compliant

---

## Data Flow Patterns

### Pattern 1: Contest Viewing

```
User opens /contest/base/0x123
  ↓
Page component renders
  ↓
useContestData hook executes
  ↓
Creates Viem client for Base chain
  ↓
Reads contract at 0x123
  ↓
Returns { name, prompt, submissionOpen, votingOpen, ... }
  ↓
Component renders contest UI
  ↓
User sees contest details
```

### Pattern 2: Frame Sharing

```
User wants to share contest
  ↓
Copies Frame URL: /api/frame/contest/base/0x123
  ↓
Posts URL in Farcaster cast
  ↓
Farcaster fetches Frame endpoint
  ↓
Endpoint queries blockchain
  ↓
Returns HTML with Frame meta tags
  ↓
Farcaster parses and renders Frame
  ↓
Other users see interactive Frame
  ↓
Click button → opens Mini App
```

### Pattern 3: Deep Linking

```
Frame button clicked
  ↓
Target: /contest/base/0x123?action=vote
  ↓
Mini App opens in Farcaster client
  ↓
SDK provides user context
  ↓
Page detects ?action=vote param
  ↓
Renders voting UI
  ↓
User is authenticated and ready to vote
```

---

## State Management

### Global State (via Context)

**FarcasterContext:**
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

**Access Pattern:**
```typescript
const { user } = useContext(FarcasterContext);

if (user) {
  // User is authenticated via Farcaster
  console.log(`Hello ${user.displayName}!`);
}
```

### Component State (via Hooks)

**useContestData:**
```typescript
{
  contest: {
    name: string;
    prompt: string;
    submissionOpen: boolean;
    votingOpen: boolean;
    submissionsCount: number;
  } | null;
  loading: boolean;
  error: string | null;
}
```

**Loading States:**
```typescript
const { contest, loading, error } = useContestData(chain, address);

if (loading) return <Spinner />;
if (error) return <Error message={error} />;
return <ContestUI contest={contest} />;
```

---

## Blockchain Integration Details

### Chain Configuration

```typescript
const CHAIN_MAP: Record<string, Chain> = {
  ethereum: mainnet,
  base: base,
  optimism: optimism,
  arbitrum: arbitrum,
  polygon: polygon,
};
```

**Why Multiple Chains:**
- JokeRace supports 90+ networks
- Contests can be on any EVM chain
- Extension must support all popular chains
- Users specify chain in URL

### Contract ABI

**Minimal Required Functions:**
```typescript
const CONTEST_ABI = [
  // Read contest metadata
  { name: 'name', outputs: [{ type: 'string' }] },
  { name: 'prompt', outputs: [{ type: 'string' }] },

  // Read timing
  { name: 'contestStart', outputs: [{ type: 'uint256' }] },
  { name: 'votingDelay', outputs: [{ type: 'uint256' }] },
  { name: 'votingPeriod', outputs: [{ type: 'uint256' }] },

  // Read submission count
  { name: 'numSubmissions', outputs: [{ type: 'uint256' }] },
] as const;
```

**Why Minimal:**
- Only include functions we actually use
- Reduces bundle size
- Easier to maintain
- Type-safe with `as const`

### RPC Configuration

```typescript
const client = createPublicClient({
  chain: base,
  transport: http(), // Uses default public RPC
});
```

**Production Considerations:**
- Default uses public RPCs (rate limited)
- For production, use dedicated RPC:
  ```typescript
  transport: http('https://your-rpc-url.com')
  ```
- Or use a service like Alchemy, Infura, QuickNode

### Error Handling

```typescript
try {
  const name = await client.readContract({ ... });
} catch (error) {
  if (error.message.includes('execution reverted')) {
    // Contract doesn't exist or invalid
    return { error: 'Contest not found' };
  }
  if (error.message.includes('rate limit')) {
    // RPC rate limited
    return { error: 'Too many requests, try again' };
  }
  // Unknown error
  throw error;
}
```

---

## Performance Optimizations

### 1. Parallel Requests

```typescript
// ❌ Sequential (slow)
const name = await readContract({ functionName: 'name' });
const prompt = await readContract({ functionName: 'prompt' });
const start = await readContract({ functionName: 'contestStart' });

// ✅ Parallel (fast)
const [name, prompt, start] = await Promise.all([
  readContract({ functionName: 'name' }),
  readContract({ functionName: 'prompt' }),
  readContract({ functionName: 'contestStart' }),
]);
```

### 2. Response Caching

```typescript
return new Response(html, {
  headers: {
    'Cache-Control': 'public, max-age=300', // 5 minutes
  }
});
```

**Caching Strategy:**
- Contest Frames: 5 minutes (relatively static)
- Vote Frames: 1 minute (more dynamic)
- OG Images: 5 minutes
- Contest pages: Client-side (React)

### 3. Edge Runtime

```typescript
// For API routes that don't need Node.js
export const runtime = 'edge';
```

**Benefits:**
- Faster cold starts
- Better global distribution
- Lower latency
- Lower costs

### 4. Lazy Loading

```typescript
// Only load SDK in browser
if (typeof window !== 'undefined') {
  import('@farcaster/miniapp-sdk').then(({ sdk }) => {
    sdk.actions.ready();
  });
}
```

---

## Security Considerations

### 1. Input Validation

```typescript
// Validate Ethereum addresses
const REGEX_ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

if (!REGEX_ETH_ADDRESS.test(address)) {
  return { error: 'Invalid address' };
}
```

### 2. Chain Whitelisting

```typescript
// Only allow known chains
if (!CHAIN_MAP[chain]) {
  return { error: 'Unsupported chain' };
}
```

### 3. Error Message Sanitization

```typescript
// Don't expose internal errors
catch (error) {
  console.error(error); // Log internally
  return { error: 'Failed to load contest' }; // Generic user message
}
```

### 4. Rate Limiting

```typescript
// Consider adding rate limiting for API routes
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

const { success } = await ratelimit.limit(ip);
if (!success) return new Response('Too many requests', { status: 429 });
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Vercel Edge                    │
│  ┌────────────┐  ┌────────────┐            │
│  │  Static    │  │   API      │            │
│  │  Assets    │  │  Routes    │            │
│  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────┘
         ↓                  ↓
┌─────────────┐    ┌───────────────────┐
│   Browser   │    │   Blockchain      │
│  (Mini App) │    │   RPC Nodes       │
└─────────────┘    └───────────────────┘
```

**Deployment Checklist:**
- ✅ Set `NEXT_PUBLIC_BASE_URL` env var
- ✅ Configure RPC URLs for production
- ✅ Enable caching headers
- ✅ Test Frame validator
- ✅ Monitor error rates
- ✅ Set up analytics

---

## Extension Points

### Adding New Features

1. **New Blockchain Queries:**
   - Add to `CONTEST_ABI`
   - Update `useContestData` hook
   - Use in components

2. **New Frame Types:**
   - Create new API route in `/api/frame/`
   - Query needed blockchain data
   - Generate Frame HTML
   - Add OG image endpoint

3. **New Pages:**
   - Create in `/app/` directory
   - Use `useContestData` hook
   - Access `FarcasterContext` for user
   - Link from existing pages

4. **New Chains:**
   - Add to `CHAIN_MAP`
   - Test with contest on that chain
   - Update documentation

---

## Key Design Decisions

### Why Next.js?
- App Router for file-based routing
- API Routes for Frame endpoints
- ImageResponse for OG images
- SSR for meta tags
- Great DX and ecosystem

### Why Viem over ethers?
- Smaller bundle size
- Better TypeScript support
- More modern API
- Tree-shakeable
- Excellent docs

### Why No Backend Database?
- Blockchain is the database
- No sync lag
- Always up-to-date
- Permissionless
- Simpler architecture

### Why Context API?
- Built into React
- No external state library needed
- Perfect for global user state
- Easy to understand

---

## Monitoring and Debugging

### Logging Strategy

```typescript
// Development
console.log('Contest data:', contest);

// Production (use error tracking)
import * as Sentry from '@sentry/nextjs';

try {
  await readContract({ ... });
} catch (error) {
  Sentry.captureException(error, {
    extra: { chain, address }
  });
}
```

### Performance Monitoring

```typescript
const startTime = Date.now();
const data = await fetchBlockchainData();
const duration = Date.now() - startTime;

console.log(`Blockchain query took ${duration}ms`);
```

### Frame Debugging

Tools:
- Warpcast Frame Validator: https://warpcast.com/~/developers/frames
- Frame Inspector: Check meta tags in browser DevTools
- Manual Testing: Share in test cast

---

## Conclusion

This architecture demonstrates:

✅ **Permissionless building** on public blockchain data
✅ **No central API** dependency
✅ **Multi-chain** support from day one
✅ **Social integration** with Farcaster
✅ **Viral sharing** through Frames
✅ **Type-safe** with TypeScript
✅ **Production-ready** patterns

The extension works as long as:
1. Blockchains exist
2. Contracts are deployed
3. RPCs are accessible

No JokeRace servers needed!

---

*This architecture enables truly permissionless, decentralized contest viewing and participation.*
