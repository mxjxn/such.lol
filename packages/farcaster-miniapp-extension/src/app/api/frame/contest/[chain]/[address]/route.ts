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
    name: 'prompt',
    outputs: [{ type: 'string' }],
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
    const [name, prompt] = await Promise.all([
      client.readContract({
        address: address as Address,
        abi: CONTEST_ABI,
        functionName: 'name',
      }),
      client.readContract({
        address: address as Address,
        abi: CONTEST_ABI,
        functionName: 'prompt',
      }),
    ]);

    // Parse prompt
    const promptParts = (prompt as string).split('|');
    const description = promptParts[2] || prompt;

    // Build Farcaster Embed HTML (using Frame protocol)
    const embedImage = `${baseUrl}/api/og/contest/${chain}/${address}`;
    const contestUrl = `${baseUrl}/contest/${chain}/${address}`;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${name}</title>

    <!-- Open Graph -->
    <meta property="og:title" content="${name}" />
    <meta property="og:description" content="${description.substring(0, 200)}" />
    <meta property="og:image" content="${embedImage}" />

    <!-- Farcaster Embed (Frame Protocol) -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${embedImage}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />

    <!-- Embed Buttons (link to Mini App) -->
    <meta property="fc:frame:button:1" content="View Contest" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${contestUrl}" />

    <meta property="fc:frame:button:2" content="Submit Entry" />
    <meta property="fc:frame:button:2:action" content="link" />
    <meta property="fc:frame:button:2:target" content="${contestUrl}?action=submit" />

    <meta property="fc:frame:button:3" content="Vote" />
    <meta property="fc:frame:button:3:action" content="link" />
    <meta property="fc:frame:button:3:target" content="${contestUrl}?action=vote" />
  </head>
  <body>
    <h1>${name}</h1>
    <p>${description}</p>
    <a href="${contestUrl}">View Contest in Mini App</a>
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
    console.error('Error generating contest embed:', error);

    const errorHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Contest Embed Error</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${baseUrl}/error.png" />
  </head>
  <body>
    <h1>Error Loading Contest</h1>
    <p>Failed to load contest embed for ${chain}/${address}</p>
  </body>
</html>
    `.trim();

    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
