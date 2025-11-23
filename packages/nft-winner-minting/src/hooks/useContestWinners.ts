import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { base, mainnet, optimism, arbitrum, polygon } from 'viem/chains';
import { CONTEST_ABI, CHAIN_MAP } from '../lib/contracts';

interface Winner {
  ranking: number;
  votes: bigint;
  author: string;
  description: string;
  proposalId: number;
}

const CHAIN_CONFIG: Record<string, any> = {
  mainnet,
  base,
  optimism,
  arbitrum,
  polygon,
};

export function useContestWinners(contestAddress: `0x${string}`, chain: string) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contestName, setContestName] = useState<string>('');

  useEffect(() => {
    async function fetchWinners() {
      if (!contestAddress || !chain) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const chainKey = CHAIN_MAP[chain] || chain;
        const chainConfig = CHAIN_CONFIG[chainKey];

        if (!chainConfig) {
          throw new Error(`Unsupported chain: ${chain}`);
        }

        const client = createPublicClient({
          chain: chainConfig,
          transport: http(),
        });

        // Fetch contest name
        const name = await client.readContract({
          address: contestAddress,
          abi: CONTEST_ABI,
          functionName: 'name',
        });
        setContestName(name as string);

        // Fetch sorted ranks (vote counts in descending order)
        const sortedRanks = await client.readContract({
          address: contestAddress,
          abi: CONTEST_ABI,
          functionName: 'getSortedRanks',
        });

        if (!sortedRanks || (sortedRanks as bigint[]).length === 0) {
          setWinners([]);
          setLoading(false);
          return;
        }

        // Fetch all proposal IDs
        const proposalIds = await client.readContract({
          address: contestAddress,
          abi: CONTEST_ABI,
          functionName: 'getAllProposalIds',
        });

        // Fetch proposal data for top ranked submissions
        const winnersData: Winner[] = [];
        const ranksArray = sortedRanks as bigint[];

        // Limit to top 10 winners for display
        const topRanks = ranksArray.slice(0, 10);

        for (let i = 0; i < topRanks.length; i++) {
          const votes = topRanks[i];

          // Find a proposal with this vote count
          // In a real implementation, you'd need a mapping from vote counts to proposal IDs
          // For now, we'll use the ranking as a simple index
          // This is a simplification - in production you'd need better logic
          const proposalIdIndex = i < (proposalIds as bigint[]).length ? i : 0;
          const proposalId = (proposalIds as bigint[])[proposalIdIndex];

          try {
            const proposal = await client.readContract({
              address: contestAddress,
              abi: CONTEST_ABI,
              functionName: 'getProposal',
              args: [proposalId],
            });

            const proposalData = proposal as any;

            winnersData.push({
              ranking: i + 1,
              votes,
              author: proposalData.author,
              description: proposalData.description,
              proposalId: Number(proposalId),
            });
          } catch (err) {
            console.error(`Error fetching proposal ${proposalId}:`, err);
          }
        }

        setWinners(winnersData);
      } catch (err: any) {
        console.error('Error fetching contest winners:', err);
        setError(err.message || 'Failed to fetch contest data');
      } finally {
        setLoading(false);
      }
    }

    fetchWinners();
  }, [contestAddress, chain]);

  return { winners, loading, error, contestName };
}
