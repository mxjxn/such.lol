'use client';

interface ContestInputProps {
  contestAddress: string;
  setContestAddress: (address: string) => void;
  chain: string;
  setChain: (chain: string) => void;
  creatorContract: string;
  setCreatorContract: (address: string) => void;
}

export function ContestInput({
  contestAddress,
  setContestAddress,
  chain,
  setChain,
  creatorContract,
  setCreatorContract,
}: ContestInputProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Contest Configuration</h2>

      <div className="space-y-4">
        {/* Chain Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chain
          </label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select a chain</option>
            <option value="base">Base</option>
            <option value="ethereum">Ethereum</option>
            <option value="optimism">Optimism</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>

        {/* Contest Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contest Address
          </label>
          <input
            type="text"
            value={contestAddress}
            onChange={(e) => setContestAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            The address of the JokeRace contest contract
          </p>
        </div>

        {/* Creator Contract Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manifold Creator Contract (Optional)
          </label>
          <input
            type="text"
            value={creatorContract}
            onChange={(e) => setCreatorContract(e.target.value)}
            placeholder="0x... (your Manifold creator contract)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Your Manifold Creator Core contract address. If you don't have one, you can{' '}
            <a
              href="https://studio.manifold.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              create one on Manifold Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
