import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
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
  {
    inputs: [],
    name: 'numSubmissions',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { chain, address } = await params;

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
    const [name, prompt, numSubmissions] = await Promise.all([
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
      client.readContract({
        address: address as Address,
        abi: CONTEST_ABI,
        functionName: 'numSubmissions',
      }).catch(() => 0n),
    ]);

    // Parse prompt
    const promptParts = (prompt as string).split('|');
    const description = promptParts[2] || prompt;
    const truncatedDesc = description.length > 200 ? description.substring(0, 200) + '...' : description;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#8A63D2',
            backgroundImage: 'linear-gradient(135deg, #8A63D2 0%, #472A91 100%)',
            padding: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '48px',
              width: '100%',
              maxWidth: '900px',
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: '#8A63D2',
                fontWeight: 'bold',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              JokeRace Contest
            </div>

            <div
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                color: '#1a1a1a',
                textAlign: 'center',
                marginBottom: '24px',
                lineHeight: 1.2,
              }}
            >
              {name as string}
            </div>

            <div
              style={{
                fontSize: 24,
                color: '#666',
                textAlign: 'center',
                marginBottom: '32px',
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              {truncatedDesc}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '32px',
                fontSize: 20,
                color: '#8A63D2',
                fontWeight: 'bold',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⛓️</span>
                <span>{chain.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span>
                <span>{Number(numSubmissions)} Submissions</span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '32px',
              fontSize: 20,
              color: 'white',
              opacity: 0.9,
            }}
          >
            View in Farcaster MiniApp
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);

    // Return error image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ff4444',
            color: 'white',
            fontSize: 48,
          }}
        >
          Error loading contest
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
