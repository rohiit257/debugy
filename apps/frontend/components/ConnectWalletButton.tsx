'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useSIWE } from '../../frontend/hooks/useSIWE'

export default function CustomConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { session, status, handleSignIn, handleSignOut } = useSIWE();

  const isAuthenticated = status === 'authenticated';

  if (isConnected && isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-white text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={handleSignOut}
          className="px-6 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg transition-colors"
        >
          Sign Out
        </button>
        <button
          onClick={() => disconnect()}
          className="px-6 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (isConnected && !isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-white text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={handleSignIn}
          disabled={status === 'loading'}
          className="px-6 py-2 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-gray-800 rounded-lg transition-colors"
        >
          {status === 'loading' ? 'Signing...' : 'Sign In with Ethereum'}
        </button>
        <button
          onClick={() => disconnect()}
          className="px-6 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div>
            {(() => {
              if (!ready) return null;

              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-6 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg transition-colors"
                  >
                    {chain.name}
                  </button>
                  <button
                    onClick={openAccountModal}
                    className="px-6 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg transition-colors"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
