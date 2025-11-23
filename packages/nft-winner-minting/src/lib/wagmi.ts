import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet, optimism, arbitrum, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'JokeRace Winner NFT Minting',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [base, mainnet, optimism, arbitrum, polygon],
  ssr: true,
});
