export interface ContestData {
  name: string;
  prompt: string;
  contestStart: bigint;
  votingDelay: bigint;
  votingPeriod: bigint;
  numSubmissions: bigint;
  contestType: string;
  isFinalized: boolean;
}

export interface Submission {
  id: string;
  author: string;
  content: string;
  votes: bigint;
  metadata?: {
    imageUrl?: string;
    description?: string;
  };
}

export interface WinningSubmission extends Submission {
  rank: number;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  image?: string;
  description?: string;
  contestAddress: string;
  chain: string;
  submissionId: string;
  creator: string;
}

export interface MintResult {
  success: boolean;
  tokenAddress?: string;
  transactionHash?: string;
  error?: string;
}
