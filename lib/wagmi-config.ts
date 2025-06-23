import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'AI Agent Marketplace',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia, polygon],
  ssr: true,
});