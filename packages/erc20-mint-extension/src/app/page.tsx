'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [contestUrl, setContestUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Parse the contest URL to extract chain and address
      // Expected format: jokerace.io/contest/{chain}/{address} or similar
      const url = new URL(contestUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);

      // Look for chain and address in the path
      const chainIndex = pathParts.findIndex(part => part === 'contest') + 1;
      const chain = pathParts[chainIndex];
      const address = pathParts[chainIndex + 1];

      if (!chain || !address) {
        setError('Invalid contest URL format. Expected: .../contest/{chain}/{address}');
        return;
      }

      // Navigate to the contest page
      router.push(`/contest/${chain}/${address}`);
    } catch (err) {
      setError('Invalid URL format');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            ERC-20 Mint Extension
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Mint winning JokeRace submissions as ERC-20 tokens on Base
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Get Started
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Enter a JokeRace contest URL to view the winning submission and mint it as an ERC-20 token.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contestUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contest URL
              </label>
              <input
                type="text"
                id="contestUrl"
                value={contestUrl}
                onChange={(e) => setContestUrl(e.target.value)}
                placeholder="https://jokerace.io/contest/base/0x..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              View Contest Winner
            </button>
          </form>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            How it works
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>Enter a JokeRace contest URL</li>
            <li>View the winning submission (contest must be completed)</li>
            <li>Configure token details (name, symbol, image)</li>
            <li>Mint the submission as an ERC-20 token on Base using Clanker</li>
            <li>Token is automatically deployed with liquidity on Uniswap V4</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
