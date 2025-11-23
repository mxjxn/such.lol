'use client';

import { use, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { FarcasterContext } from '../../../../../providers';

interface PageProps {
  params: Promise<{
    chain: string;
    address: string;
    id: string;
  }>;
  searchParams: Promise<{
    action?: string;
  }>;
}

export default function SubmissionPage({ params, searchParams }: PageProps) {
  const { chain, address, id } = use(params);
  const { action } = use(searchParams);
  const { user } = useContext(FarcasterContext);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/contest/${chain}/${address}`)}
          className="text-farcaster-purple hover:underline font-semibold"
        >
          ← Back to Contest
        </button>

        {/* Submission Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-5xl">📝</div>
            <div>
              <h1 className="text-3xl font-bold">Submission #{id}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Contest on {chain}
              </p>
            </div>
          </div>
        </div>

        {/* User Context */}
        {user && (
          <div className="bg-farcaster-purple/10 dark:bg-farcaster-purple/20 rounded-lg p-4 border border-farcaster-purple/30">
            <div className="flex items-center gap-3">
              {user.pfpUrl && (
                <img
                  src={user.pfpUrl}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Indicator */}
        {action && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 font-semibold">
              {action === 'vote-for' && '👍 Ready to vote FOR this submission'}
              {action === 'vote-against' && '👎 Ready to vote AGAINST this submission'}
              {!action.startsWith('vote') && `Action: ${action}`}
            </p>
          </div>
        )}

        {/* Submission Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Submission Content</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400">
              Loading submission content from blockchain...
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Contract: {address}
              <br />
              Submission ID: {id}
            </p>
          </div>
        </div>

        {/* Voting Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Cast Your Vote</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors">
              👍 Vote For
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors">
              👎 Vote Against
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            Voting requires connecting your wallet
          </p>
        </div>

        {/* Share Embed */}
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3">Share on Farcaster</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Share this submission as a Farcaster embed:
          </p>
          <div className="bg-white dark:bg-gray-800 rounded p-3 font-mono text-sm overflow-x-auto">
            {typeof window !== 'undefined' &&
              `${window.location.origin}/api/frame/submission/${chain}/${address}/${id}`
            }
          </div>
          <button
            onClick={() => {
              const url = `${window.location.origin}/api/frame/submission/${chain}/${address}/${id}`;
              navigator.clipboard.writeText(url);
              alert('Embed URL copied to clipboard!');
            }}
            className="mt-3 bg-farcaster-purple hover:bg-farcaster-dark text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Copy Embed URL
          </button>
        </div>

        {/* View on JokeRace */}
        <div className="text-center">
          <a
            href={`https://jokerace.io/contest/${chain}/${address}/submission/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-farcaster-purple hover:underline font-semibold"
          >
            View on JokeRace.io →
          </a>
        </div>
      </div>
    </main>
  );
}
