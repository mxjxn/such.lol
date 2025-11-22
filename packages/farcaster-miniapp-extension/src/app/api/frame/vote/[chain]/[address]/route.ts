import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { base, mainnet, optimism, arbitrum, polygon } from 'viem/chains';

const CHAIN_MAP: Record<string, any> = {
  ethereum: mainnet,
  base: base,
  optimism: optimism,
  arbitrum: arbitrum,
  polygon: polygon,
};

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
    name: 'numSubmissions',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contestStart',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'votingDelay',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'votingPeriod',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { chain, address } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

  try {
    // Get chain config
    const chainConfig = CHAIN_MAP[chain.toLowerCase()];
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    // Create public client
    const client = createPublicClient({
      chain: chainConfig,
      transport: http(),
    });

    // Fetch contest data
    const [name, numSubmissions, contestStart, votingDelay, votingPeriod] = await Promise.all([
      client.readContract({
        address: address as Address,
        abi: CONTEST_ABI,
        functionName: 'name',
      }),
      client.readContract({
        address: address as Address,
        abi: CONTEST_ABI,
        functionName: 'numSubmissions',
      }).catch(() => 0n),
      client.readContract({
        address: address as Address,
        abi: CONTEST_ABI,
        functionName: 'contestStart',
      }),
      client.readContract({
        address: address as Address,
        abi: CONTEST_ABI,
        functionName: 'votingDelay',
      }),
      client.readContract({
        address: address as Address,
        abi: CONTEST_ABI,
        functionName: 'votingPeriod',
      }),
    ]);

    // Calculate voting status
    const now = BigInt(Math.floor(Date.now() / 1000));
    const submissionEnd = contestStart + votingDelay;
    const votingEnd = submissionEnd + votingPeriod;
    const votingOpen = now >= submissionEnd && now < votingEnd;

    // Build Frame HTML
    const frameImage = `${baseUrl}/api/og/contest/${chain}/${address}?view=vote`;
    const contestUrl = `${baseUrl}/contest/${chain}/${address}?action=vote`;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vote - ${name}</title>

    <!-- Open Graph -->
    <meta property="og:title" content="Vote on ${name}" />
    <meta property="og:description" content="${votingOpen ? 'Voting is now open!' : 'Voting period has ended'} - ${Number(numSubmissions)} submissions" />
    <meta property="og:image" content="${frameImage}" />

    <!-- Farcaster Frame -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${frameImage}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />

    <!-- Frame Buttons -->
    ${votingOpen ? `
    <meta property="fc:frame:button:1" content="Vote Now (${Number(numSubmissions)} entries)" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${contestUrl}" />
    ` : `
    <meta property="fc:frame:button:1" content="View Results" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${contestUrl}" />
    `}

    <meta property="fc:frame:button:2" content="View Contest" />
    <meta property="fc:frame:button:2:action" content="link" />
    <meta property="fc:frame:button:2:target" content="${baseUrl}/contest/${chain}/${address}" />
  </head>
  <body>
    <h1>Vote on ${name}</h1>
    <p>${votingOpen ? 'Voting is now open!' : 'Voting has ended'}</p>
    <p>${Number(numSubmissions)} submissions</p>
    <a href="${contestUrl}">Vote in MiniApp</a>
  </body>
</html>
    `.trim();

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=60', // Shorter cache for voting status
      },
    });
  } catch (error) {
    console.error('Error generating vote frame:', error);

    const errorHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Vote Frame Error</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${baseUrl}/error.png" />
  </head>
  <body>
    <h1>Error Loading Voting Frame</h1>
    <p>Failed to load voting frame for ${chain}/${address}</p>
  </body>
</html>
    `.trim();

    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
