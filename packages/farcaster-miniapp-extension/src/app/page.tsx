'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { FarcasterContext } from './providers';

export default function Home() {
  const [contestUrl, setContestUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, isReady } = useContext(FarcasterContext);

  const parseContestUrl = (url: string) => {
    try {
      // Expected format: https://jokerace.io/contest/{chain}/{address}
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      if (pathParts[0] === 'contest' && pathParts.length >= 3) {
        return {
          chain: pathParts[1],
          address: pathParts[2],
        };
      }

      throw new Error('Invalid contest URL format');
    } catch (err) {
      throw new Error('Please enter a valid JokeRace contest URL');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { chain, address } = parseContestUrl(contestUrl);
      router.push(`/contest/${chain}/${address}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid URL');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-farcaster-purple to-farcaster-dark bg-clip-text text-transparent">
            JokeRace MiniApp
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            View and participate in JokeRace contests directly from Farcaster
          </p>
        </div>

        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-farcaster-purple/20">
            <div className="flex items-center gap-4">
              {user.pfpUrl && (
                <img
                  src={user.pfpUrl}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connected as
                </p>
                <p className="text-lg font-bold">{user.displayName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{user.username} · FID: {user.fid}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Enter Contest URL</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Paste a JokeRace contest URL to view it in the MiniApp. Example:
            <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              https://jokerace.io/contest/base/0x...
            </code>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={contestUrl}
                onChange={(e) => setContestUrl(e.target.value)}
                placeholder="https://jokerace.io/contest/..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-farcaster-purple focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-farcaster-purple hover:bg-farcaster-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              View Contest
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-3">Features</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-farcaster-purple font-bold">✓</span>
              <span>View contest details and submissions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-farcaster-purple font-bold">✓</span>
              <span>Submit entries using your Farcaster identity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-farcaster-purple font-bold">✓</span>
              <span>Vote on submissions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-farcaster-purple font-bold">✓</span>
              <span>Share contests with your Farcaster network</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-farcaster-purple font-bold">✓</span>
              <span>Track contest progress and results</span>
            </li>
          </ul>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Built as a JokeRace Extension ·{' '}
            <a
              href="https://docs.jokerace.io/technical-how-tos/building-an-extension"
              target="_blank"
              rel="noopener noreferrer"
              className="text-farcaster-purple hover:underline"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
