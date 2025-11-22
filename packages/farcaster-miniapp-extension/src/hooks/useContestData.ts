import { useEffect, useState } from 'react';
import { createPublicClient, http, Address } from 'viem';
import { base, mainnet, optimism, arbitrum, polygon } from 'viem/chains';

// Chain mapping
const CHAIN_MAP: Record<string, any> = {
  ethereum: mainnet,
  base: base,
  optimism: optimism,
  arbitrum: arbitrum,
  polygon: polygon,
};

// Minimal Contest ABI - just the functions we need
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
  {
    inputs: [],
    name: 'numSubmissions',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface ContestData {
  name: string;
  prompt: string;
  contestType: string;
  submissionOpen: boolean;
  votingOpen: boolean;
  submissionsCount?: number;
}

export function useContestData(chain: string, address: string) {
  const [contest, setContest] = useState<ContestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContestData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the chain config
        const chainConfig = CHAIN_MAP[chain.toLowerCase()];
        if (!chainConfig) {
          throw new Error(`Unsupported chain: ${chain}`);
        }

        // Create public client
        const client = createPublicClient({
          chain: chainConfig,
          transport: http(),
        });

        // Fetch contest data from blockchain
        const [name, prompt, contestStart, votingDelay, votingPeriod, numSubmissions] =
          await Promise.all([
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
            client
              .readContract({
                address: address as Address,
                abi: CONTEST_ABI,
                functionName: 'numSubmissions',
              })
              .catch(() => 0n), // Some older contracts may not have this
          ]);

        // Calculate contest phases
        const now = BigInt(Math.floor(Date.now() / 1000));
        const submissionEnd = contestStart + votingDelay;
        const votingEnd = submissionEnd + votingPeriod;

        const submissionOpen = now >= contestStart && now < submissionEnd;
        const votingOpen = now >= submissionEnd && now < votingEnd;

        // Parse prompt (it's in format: title|author|description)
        const promptParts = (prompt as string).split('|');
        const description = promptParts[2] || prompt;

        setContest({
          name: name as string,
          prompt: description,
          contestType: 'Contest',
          submissionOpen,
          votingOpen,
          submissionsCount: Number(numSubmissions),
        });
      } catch (err) {
        console.error('Error fetching contest data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contest data');
      } finally {
        setLoading(false);
      }
    };

    if (address && chain) {
      fetchContestData();
    }
  }, [chain, address]);

  return { contest, loading, error };
}
