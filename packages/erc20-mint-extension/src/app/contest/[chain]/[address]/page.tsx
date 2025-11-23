'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWinningSubmission } from '@/hooks/useWinningSubmission';
import type { MintResult } from '@/types';

export default function ContestPage() {
  const params = useParams();
  const chain = params.chain as string;
  const address = params.address as string;

  const { winner, contest, loading, error } = useWinningSubmission(chain, address);

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenImage, setTokenImage] = useState('');
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);

  const handleMint = async () => {
    if (!winner || !contest) return;

    setMinting(true);
    setMintResult(null);

    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tokenName || `${contest.name} Winner`,
          symbol: tokenSymbol || 'WINNER',
          image: tokenImage || undefined,
          description: winner.content,
          contestAddress: address,
          chain: chain,
          submissionId: winner.id,
          creator: winner.author,
        }),
      });

      const result: MintResult = await response.json();
      setMintResult(result);
    } catch (err) {
      setMintResult({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to mint token',
      });
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading contest data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {contest?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{contest?.prompt}</p>
        </div>

        {winner && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Winning Submission
                </h2>
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-full font-semibold">
                  #{winner.rank} Winner
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Author:</span> {winner.author}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Votes:</span> {winner.votes.toString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-lg text-gray-900 dark:text-white">{winner.content}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Mint as ERC-20 Token
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder={`${contest?.name || 'Contest'} Winner`}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Token Symbol
                  </label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                    placeholder="WINNER"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token Image URL (optional)
                </label>
                <input
                  type="url"
                  value={tokenImage}
                  onChange={(e) => setTokenImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleMint}
                disabled={minting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {minting ? 'Minting Token...' : 'Mint ERC-20 Token on Base'}
              </button>

              {mintResult && (
                <div
                  className={`rounded-lg p-6 ${
                    mintResult.success
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {mintResult.success ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        Token Minted Successfully!
                      </h4>
                      <p className="text-green-800 dark:text-green-200">
                        <span className="font-medium">Token Address:</span>{' '}
                        <a
                          href={`https://basescan.org/token/${mintResult.tokenAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-green-600 dark:hover:text-green-400"
                        >
                          {mintResult.tokenAddress}
                        </a>
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your token has been deployed on Base with liquidity on Uniswap V4!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        Minting Failed
                      </h4>
                      <p className="text-red-800 dark:text-red-200">{mintResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">About Token Minting</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>Tokens are deployed on Base blockchain using Clanker SDK</li>
            <li>Total supply: 100 billion tokens (non-mintable)</li>
            <li>Automatic liquidity pairing with WETH on Uniswap V4</li>
            <li>Initial market cap: ~10 ETH</li>
            <li>Creator receives 5% of supply</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
