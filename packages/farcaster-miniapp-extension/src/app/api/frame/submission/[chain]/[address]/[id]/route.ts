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
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'proposalAddresses',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string; id: string }> }
) {
  const { chain, address, id } = await params;
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

    // Fetch contest name
    const contestName = await client.readContract({
      address: address as Address,
      abi: CONTEST_ABI,
      functionName: 'name',
    });

    // Build Frame HTML
    const frameImage = `${baseUrl}/api/og/submission/${chain}/${address}/${id}`;
    const submissionUrl = `${baseUrl}/contest/${chain}/${address}/submission/${id}`;
    const contestUrl = `${baseUrl}/contest/${chain}/${address}`;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Submission #${id} - ${contestName}</title>

    <!-- Open Graph -->
    <meta property="og:title" content="Submission #${id}" />
    <meta property="og:description" content="Vote on this submission in ${contestName}" />
    <meta property="og:image" content="${frameImage}" />

    <!-- Farcaster Frame -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${frameImage}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />

    <!-- Frame Buttons -->
    <meta property="fc:frame:button:1" content="Vote For" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${submissionUrl}?action=vote-for" />

    <meta property="fc:frame:button:2" content="Vote Against" />
    <meta property="fc:frame:button:2:action" content="link" />
    <meta property="fc:frame:button:2:target" content="${submissionUrl}?action=vote-against" />

    <meta property="fc:frame:button:3" content="View Contest" />
    <meta property="fc:frame:button:3:action" content="link" />
    <meta property="fc:frame:button:3:target" content="${contestUrl}" />

    <meta property="fc:frame:button:4" content="Visit" />
    <meta property="fc:frame:button:4:action" content="link" />
    <meta property="fc:frame:button:4:target" content="${submissionUrl}" />
  </head>
  <body>
    <h1>Submission #${id}</h1>
    <p>Contest: ${contestName}</p>
    <a href="${submissionUrl}">View Submission in MiniApp</a>
  </body>
</html>
    `.trim();

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error generating submission frame:', error);

    const errorHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Submission Frame Error</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${baseUrl}/error.png" />
  </head>
  <body>
    <h1>Error Loading Submission</h1>
    <p>Failed to load submission frame for ${chain}/${address}/${id}</p>
  </body>
</html>
    `.trim();

    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
