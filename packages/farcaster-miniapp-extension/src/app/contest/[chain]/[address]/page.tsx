'use client';

import { use, useContext, useEffect, useState } from 'react';
import { FarcasterContext } from '../../../providers';
import { useContestData } from '@hooks/useContestData';

interface PageProps {
  params: Promise<{
    chain: string;
    address: string;
  }>;
}

export default function ContestPage({ params }: PageProps) {
  const { chain, address } = use(params);
  const { user } = useContext(FarcasterContext);
  const { contest, loading, error } = useContestData(chain, address);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farcaster-purple mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading contest...
          </p>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-lg">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
            Error Loading Contest
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error || 'Failed to load contest data'}
          </p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Chain: {chain} | Address: {address}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{contest.name}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="font-semibold">Chain:</span> {chain}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold">Type:</span> {contest.contestType}
                </span>
                {contest.submissionsCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">Submissions:</span>{' '}
                    {contest.submissionsCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {contest.prompt && (
            <div className="mt-4 prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: contest.prompt }} />
            </div>
          )}
        </div>

        {/* User Info */}
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

        {/* Contest Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Contest Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Submission Period
              </span>
              <span className="font-semibold">
                {contest.submissionOpen ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Open
                  </span>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Voting Period
              </span>
              <span className="font-semibold">
                {contest.votingOpen ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Open
                  </span>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contest.submissionOpen && (
            <button className="bg-farcaster-purple hover:bg-farcaster-dark text-white font-bold py-4 px-6 rounded-lg transition-colors">
              Submit Entry
            </button>
          )}
          {contest.votingOpen && (
            <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-colors">
              View Submissions & Vote
            </button>
          )}
        </div>

        {/* Link to Main Site */}
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            View full contest on JokeRace
          </p>
          <a
            href={`https://jokerace.io/contest/${chain}/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-farcaster-purple hover:underline font-semibold"
          >
            https://jokerace.io/contest/{chain}/{address}
          </a>
        </div>

        {/* Contract Address */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-500">
          <p>Contract: {address}</p>
        </div>
      </div>
    </main>
  );
}
