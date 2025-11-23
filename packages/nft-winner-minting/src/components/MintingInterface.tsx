'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { WINNER_MINTER_ABI, WINNER_MINTER_ADDRESSES, CHAIN_MAP } from '../lib/contracts';

interface MintingInterfaceProps {
  contestAddress: `0x${string}`;
  chain: string;
  creatorContract: `0x${string}`;
}

export function MintingInterface({
  contestAddress,
  chain,
  creatorContract,
}: MintingInterfaceProps) {
  const { address } = useAccount();
  const [maxWinners, setMaxWinners] = useState(3);
  const [selectedRankings, setSelectedRankings] = useState<number[]>([1, 2, 3]);

  const chainKey = CHAIN_MAP[chain] || chain;
  const winnerMinterAddress = WINNER_MINTER_ADDRESSES[chainKey];

  // Check if contest is authorized
  const { data: isAuthorized } = useReadContract({
    address: winnerMinterAddress,
    abi: WINNER_MINTER_ABI,
    functionName: 'authorizedContests',
    args: [creatorContract, contestAddress],
  });

  // Authorize contest
  const { writeContract: authorizeContest, isPending: isAuthorizing } = useWriteContract();

  // Mint winners
  const { writeContract: mintWinners, isPending: isMinting } = useWriteContract();

  const handleAuthorize = () => {
    if (!winnerMinterAddress || winnerMinterAddress === '0x0000000000000000000000000000000000000000') {
      alert('WinnerMinter contract not deployed on this chain yet. Please deploy it first.');
      return;
    }

    authorizeContest({
      address: winnerMinterAddress,
      abi: WINNER_MINTER_ABI,
      functionName: 'authorizeContest',
      args: [creatorContract, contestAddress, BigInt(maxWinners)],
    });
  };

  const handleMint = () => {
    if (!winnerMinterAddress || winnerMinterAddress === '0x0000000000000000000000000000000000000000') {
      alert('WinnerMinter contract not deployed on this chain yet. Please deploy it first.');
      return;
    }

    if (selectedRankings.length === 0) {
      alert('Please select at least one ranking to mint');
      return;
    }

    const rankings = selectedRankings.map((r) => BigInt(r));

    mintWinners({
      address: winnerMinterAddress,
      abi: WINNER_MINTER_ABI,
      functionName: 'mintWinnersBatch',
      args: [creatorContract, contestAddress, rankings],
    });
  };

  const toggleRanking = (ranking: number) => {
    setSelectedRankings((prev) =>
      prev.includes(ranking)
        ? prev.filter((r) => r !== ranking)
        : [...prev, ranking].sort((a, b) => a - b)
    );
  };

  if (winnerMinterAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start">
          <div className="text-yellow-600 text-2xl mr-3">⚠️</div>
          <div>
            <h3 className="text-yellow-900 font-semibold mb-1">
              Contract Not Deployed
            </h3>
            <p className="text-yellow-700 text-sm">
              The WinnerMinter contract hasn't been deployed on {chain} yet. Please deploy it
              first using the smart contract in `src/contracts/WinnerMinter.sol`.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mint Winners as NFTs</h2>

      {!isAuthorized ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium mb-2">Step 1: Authorize Contest</p>
            <p className="text-blue-700 text-sm mb-4">
              First, you need to authorize this contest for NFT minting. This allows the
              WinnerMinter extension to mint NFTs from your creator contract.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Winners to Mint
              </label>
              <input
                type="number"
                value={maxWinners}
                onChange={(e) => setMaxWinners(Number(e.target.value))}
                min={1}
                max={100}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum number of winners you want to allow minting for
              </p>
            </div>

            <button
              onClick={handleAuthorize}
              disabled={isAuthorizing || !address}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAuthorizing ? 'Authorizing...' : 'Authorize Contest'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <span className="text-green-600 text-xl mr-2">✓</span>
              <p className="text-green-900 font-medium">Contest Authorized</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Rankings to Mint
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(maxWinners, 10) }, (_, i) => i + 1).map(
                (ranking) => (
                  <button
                    key={ranking}
                    onClick={() => toggleRanking(ranking)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedRankings.includes(ranking)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{ranking}
                  </button>
                )
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedRankings.length} winner(s)
            </p>
          </div>

          <button
            onClick={handleMint}
            disabled={isMinting || !address || selectedRankings.length === 0}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isMinting
              ? 'Minting...'
              : `Mint ${selectedRankings.length} Winner${
                  selectedRankings.length !== 1 ? 's' : ''
                } as NFTs`}
          </button>

          <p className="text-center text-sm text-gray-500">
            Each winner will receive a 1/1 NFT of their submission
          </p>
        </div>
      )}
    </div>
  );
}
