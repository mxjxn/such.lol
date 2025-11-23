'use client';

import { useContestWinners } from '../hooks/useContestWinners';

interface WinnerListProps {
  contestAddress: `0x${string}`;
  chain: string;
}

export function WinnerList({ contestAddress, chain }: WinnerListProps) {
  const { winners, loading, error, contestName } = useContestWinners(contestAddress, chain);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading contest winners...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start">
          <div className="text-red-600 text-2xl mr-3">⚠️</div>
          <div>
            <h3 className="text-red-900 font-semibold mb-1">Error Loading Contest</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!winners || winners.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start">
          <div className="text-yellow-600 text-2xl mr-3">ℹ️</div>
          <div>
            <h3 className="text-yellow-900 font-semibold mb-1">No Winners Yet</h3>
            <p className="text-yellow-700 text-sm">
              This contest doesn't have any ranked submissions yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {contestName || 'Contest Winners'}
        </h2>
        <p className="text-gray-600 mt-1">
          Top ranked submissions eligible for NFT minting
        </p>
      </div>

      <div className="space-y-3">
        {winners.map((winner, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-bold text-sm">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="text-sm text-gray-500">
                      {winner.votes.toString()} votes
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 mt-2 line-clamp-2">
                  {winner.description}
                </p>
                <div className="mt-2 text-xs text-gray-500 font-mono">
                  Author: {winner.author.slice(0, 6)}...{winner.author.slice(-4)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
