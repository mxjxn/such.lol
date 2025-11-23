import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from 'clanker-sdk/v4';
import type { ClankerTokenV4 } from 'clanker-sdk';
import type { TokenConfig, MintResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, symbol, image, description, contestAddress, chain, submissionId, creator } = body as TokenConfig;

    // Validate required fields
    if (!name || !symbol || !contestAddress || !chain) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, symbol, contestAddress, chain' },
        { status: 400 }
      );
    }

    // Only support Base chain for now (Clanker deploys on Base)
    if (chain.toLowerCase() !== 'base') {
      return NextResponse.json(
        { success: false, error: 'Only Base chain is supported for token minting' },
        { status: 400 }
      );
    }

    // Check for private key in environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error: PRIVATE_KEY not set' },
        { status: 500 }
      );
    }

    // Initialize wallet and clients
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    // Initialize Clanker SDK
    const clanker = new Clanker({
      wallet: walletClient,
      publicClient: publicClient as any, // Type assertion to handle viem version mismatch
    });

    // Prepare token configuration for Clanker
    const tokenConfig: ClankerTokenV4 = {
      name,
      symbol,
      image: image || '',
      tokenAdmin: account.address,
      metadata: {
        description: description || `Token minted for winning submission from JokeRace contest: ${contestAddress}`,
      },
      context: {
        interface: 'jokerace-erc20-mint-extension',
        platform: 'jokerace',
        messageId: `${contestAddress}-${submissionId}`,
      },
      vault: {
        percentage: 5, // 5% to creator
        lockupDuration: 0, // No lockup
        vestingDuration: 30 * 24 * 60 * 60, // 30 days in seconds
        recipient: creator as `0x${string}` | undefined,
      },
    };

    // Deploy token using Clanker SDK
    console.log('Deploying token with config:', tokenConfig);
    const deployResult = await clanker.deploy(tokenConfig);

    if (!deployResult || 'error' in deployResult) {
      throw new Error(deployResult?.error?.message || 'Failed to deploy token');
    }

    // Wait for the transaction to be confirmed and get the token address
    const { address: tokenAddress } = await deployResult.waitForTransaction();

    const mintResult: MintResult = {
      success: true,
      tokenAddress,
      transactionHash: deployResult.txHash,
    };

    return NextResponse.json(mintResult, { status: 200 });

  } catch (error) {
    console.error('Error minting token:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    const result: MintResult = {
      success: false,
      error: errorMessage,
    };

    return NextResponse.json(result, { status: 500 });
  }
}

// Handle GET requests with information about the API
export async function GET() {
  return NextResponse.json({
    name: 'ERC-20 Mint API',
    description: 'Mint winning JokeRace submissions as ERC-20 tokens using Clanker SDK',
    method: 'POST',
    requiredFields: ['name', 'symbol', 'contestAddress', 'chain'],
    optionalFields: ['image', 'description', 'submissionId', 'creator'],
    supportedChains: ['base'],
  });
}
