import { Address } from 'viem';

export const CHAIN_MAP: Record<string, any> = {
  ethereum: 'mainnet',
  eth: 'mainnet',
  base: 'base',
  optimism: 'optimism',
  opt: 'optimism',
  arbitrum: 'arbitrum',
  arb: 'arbitrum',
  polygon: 'polygon',
  matic: 'polygon',
};

export const CONTEST_ABI = [
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      {
        components: [
          { name: 'author', type: 'address' },
          { name: 'exists', type: 'bool' },
          { name: 'description', type: 'string' },
          { name: 'targetMetadata', type: 'address' },
          { name: 'safeMetadata', type: 'address' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'index', type: 'uint256' }],
    name: 'sortedRanks',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSortedRanks',
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllProposalIds',
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const WINNER_MINTER_ABI = [
  {
    inputs: [
      { name: 'creatorContract', type: 'address' },
      { name: 'contestAddress', type: 'address' },
      { name: 'maxWinners', type: 'uint256' },
    ],
    name: 'authorizeContest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'creatorContract', type: 'address' },
      { name: 'contestAddress', type: 'address' },
      { name: 'ranking', type: 'uint256' },
    ],
    name: 'mintWinner',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'creatorContract', type: 'address' },
      { name: 'contestAddress', type: 'address' },
      { name: 'rankings', type: 'uint256[]' },
    ],
    name: 'mintWinnersBatch',
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'creatorContract', type: 'address' },
      { name: 'contestAddress', type: 'address' },
    ],
    name: 'authorizedContests',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'creatorContract', type: 'address' },
      { name: 'contestAddress', type: 'address' },
      { name: 'ranking', type: 'uint256' },
    ],
    name: 'rankingToTokenId',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Deployment addresses (to be updated after deployment)
export const WINNER_MINTER_ADDRESSES: Record<string, Address> = {
  mainnet: '0x0000000000000000000000000000000000000000', // To be deployed
  base: '0x0000000000000000000000000000000000000000', // To be deployed
  optimism: '0x0000000000000000000000000000000000000000', // To be deployed
  arbitrum: '0x0000000000000000000000000000000000000000', // To be deployed
  polygon: '0x0000000000000000000000000000000000000000', // To be deployed
};
