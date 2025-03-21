"use client";

// components/wallet-button.tsx
import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletButton() {
  // State to handle client-side only rendering
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return simple button placeholder during SSR to avoid hydration issues
  if (!mounted) {
    return (
      <div className="p-1 rounded-lg bg-gradient-to-r from-green-500/40 via-green-400/40 to-green-500/40">
        <div className="p-px bg-gray-800 rounded-lg">
          <button
            type="button"
            className="bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold px-6 py-2.5 rounded-md opacity-80"
            disabled
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 rounded-lg bg-gradient-to-r from-green-500/40 via-green-400/40 to-green-500/40">
      <div className="p-px bg-gray-800 rounded-lg">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            return (
              <div
                {...(!mounted && {
                  "aria-hidden": true,
                  className: "opacity-0 pointer-events-none user-select-none",
                })}
              >
                {(() => {
                  if (!mounted || !account || !chain) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-green-900/60 hover:to-green-800/60 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)] text-white font-semibold px-6 py-2.5 rounded-md transition-all duration-300"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="bg-gradient-to-r from-red-900/80 to-red-800/80 hover:shadow-[0_0_10px_rgba(220,38,38,0.5)] text-white font-semibold px-4 py-2.5 rounded-md transition-all duration-300"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="flex items-center gap-1.5 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-medium py-2 px-3 rounded-md"
                      >
                        {chain.hasIcon && (
                          <div className="w-5 h-5 rounded-full overflow-hidden">
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                className="w-5 h-5"
                              />
                            )}
                          </div>
                        )}
                        <span>{chain.name}</span>
                      </button>

                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="flex items-center gap-1.5 bg-gradient-to-r from-green-900/80 to-green-800/80 hover:from-green-800/90 hover:to-green-700/90 hover:shadow-[0_0_8px_rgba(34,197,94,0.4)] text-white font-medium py-2 px-3 rounded-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{account.displayName}</span>
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
}
