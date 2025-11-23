'use client';

import { useState, useEffect } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { getChain } from '@/lib/chains';
import { CONTEST_ABI, RPC_URLS } from '@/lib/contracts';
import type { WinningSubmission, ContestData } from '@/types';

export function useWinningSubmission(chain: string, address: string) {
  const [winner, setWinner] = useState<WinningSubmission | null>(null);
  const [contest, setContest] = useState<ContestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWinner() {
      try {
        setLoading(true);
        setError(null);

        const chainConfig = getChain(chain);
        if (!chainConfig) {
          throw new Error(`Unsupported chain: ${chain}`);
        }

        const client = createPublicClient({
          chain: chainConfig,
          transport: http(RPC_URLS[chain] || undefined),
        });

        // Fetch contest data and all submissions in parallel
        const [
          name,
          prompt,
          contestStart,
          votingDelay,
          votingPeriod,
          numSubmissions,
          allSubmissions,
        ] = await Promise.all([
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
          client.readContract({
            address: address as Address,
            abi: CONTEST_ABI,
            functionName: 'numSubmissions',
          }),
          client.readContract({
            address: address as Address,
            abi: CONTEST_ABI,
            functionName: 'getAllSubmissionInfo',
          }),
        ]);

        // Check if contest has ended
        const now = BigInt(Math.floor(Date.now() / 1000));
        const votingEnd = contestStart + votingDelay + votingPeriod;
        const isFinalized = now > votingEnd;

        const contestData: ContestData = {
          name: name as string,
          prompt: prompt as string,
          contestStart,
          votingDelay,
          votingPeriod,
          numSubmissions,
          contestType: 'voting',
          isFinalized,
        };

        setContest(contestData);

        if (!isFinalized) {
          setError('Contest is still ongoing. Winner will be available after voting ends.');
          setLoading(false);
          return;
        }

        // Find the submission with the most votes
        if (!allSubmissions || allSubmissions.length === 0) {
          throw new Error('No submissions found');
        }

        let winningSubmission = allSubmissions[0];
        let winningIndex = 0;

        allSubmissions.forEach((submission: any, index: number) => {
          if (submission.totalVotes > winningSubmission.totalVotes) {
            winningSubmission = submission;
            winningIndex = index;
          }
        });

        const winner: WinningSubmission = {
          id: winningIndex.toString(),
          author: winningSubmission.author,
          content: winningSubmission.content,
          votes: winningSubmission.totalVotes,
          rank: 1,
        };

        setWinner(winner);
      } catch (err) {
        console.error('Error fetching winner:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch winner');
      } finally {
        setLoading(false);
      }
    }

    if (chain && address) {
      fetchWinner();
    }
  }, [chain, address]);

  return { winner, contest, loading, error };
}
