'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ContestInput } from '../components/ContestInput';
import { WinnerList } from '../components/WinnerList';
import { MintingInterface } from '../components/MintingInterface';

export default function Home() {
  const { isConnected } = useAccount();
  const [contestAddress, setContestAddress] = useState('');
  const [chain, setChain] = useState('');
  const [creatorContract, setCreatorContract] = useState('');

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🏆 JokeRace Winner NFT Minting
            </h1>
            <p className="text-gray-600">
              Mint winning contest submissions as 1/1 NFTs using Manifold Creator Core
            </p>
          </div>
          <ConnectButton />
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600">
              Connect your wallet to start minting winning submissions as NFTs
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contest Input */}
            <ContestInput
              contestAddress={contestAddress}
              setContestAddress={setContestAddress}
              chain={chain}
              setChain={setChain}
              creatorContract={creatorContract}
              setCreatorContract={setCreatorContract}
            />

            {/* Winner List & Minting Interface */}
            {contestAddress && chain && (
              <>
                <WinnerList
                  contestAddress={contestAddress as `0x${string}`}
                  chain={chain}
                />

                {creatorContract && (
                  <MintingInterface
                    contestAddress={contestAddress as `0x${string}`}
                    chain={chain}
                    creatorContract={creatorContract as `0x${string}`}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Built with ❤️ for JokeRace • Powered by{' '}
            <a
              href="https://manifold.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Manifold Creator Core
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
