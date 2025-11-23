import { base } from 'viem/chains';
import type { Chain } from 'viem';

export const SUPPORTED_CHAINS: Record<string, Chain> = {
  base: base,
};

export function getChain(chainName: string): Chain | null {
  return SUPPORTED_CHAINS[chainName.toLowerCase()] || null;
}

export function isChainSupported(chainName: string): boolean {
  return chainName.toLowerCase() in SUPPORTED_CHAINS;
}
