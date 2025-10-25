"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { RainbowKitProvider, getDefaultConfig, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig } from "wagmi";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { polygon, mainnet, sepolia } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, polygon],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider modalSize="compact">
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}


