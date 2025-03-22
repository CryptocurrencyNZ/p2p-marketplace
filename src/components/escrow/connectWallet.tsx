import React, { useState } from "react";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";
import { Wallet, AlertTriangle, ChevronDown, ExternalLink } from "lucide-react";

// Define types for component props
interface WalletConnectProps {
  setSigner: (signer: JsonRpcSigner | null) => void;
}

function WalletConnect({ setSigner }: WalletConnectProps): React.ReactElement {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  async function connectWallet(): Promise<void> {
    if (connecting) return;
    
    try {
      setConnecting(true);
      setError(null);
      
      let web3Provider: BrowserProvider;
      
      if (window.ethereum) {
        // Use MetaMask (Injected Provider) if available
        web3Provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } else {
        // Use WalletConnect if MetaMask is NOT available
        const wcProvider = await EthereumProvider.init({
          projectId: "c2b82264f970413130f1152c90cf9b45", // hard code this for now, use .env var later
          chains: [84532], // Base Sepolia since thats what im building the demo on
          showQrModal: true,
        });
        
        await wcProvider.enable();
        web3Provider = new ethers.BrowserProvider(wcProvider);
      }
      
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(web3Provider);
      setAccount(address);
      setSigner(signer);
      
      console.log(`Connected: ${address}`);
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      setError(error?.message || "Failed to connect wallet");
      setSigner(null);
    } finally {
      setConnecting(false);
    }
  }

  function disconnectWallet(): void {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setShowDropdown(false);
  }

  function toggleDropdown(): void {
    setShowDropdown(!showDropdown);
  }

  // Format address for display
  const displayAddress = account 
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "";

  return (
    <div className="backdrop-blur-sm bg-gray-800/90 border border-gray-700 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] p-4">
      {error && (
        <div className="mb-4 p-3 rounded-lg flex items-start gap-2 text-sm bg-red-900/20 border border-red-700/50 text-red-400">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
      
      {!account ? (
        <button 
          onClick={connectWallet} 
          disabled={connecting}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {connecting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={18} className="mr-2" />
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="w-full bg-gradient-to-r from-green-900/70 to-green-800/70 border border-green-700/50 text-green-300 font-medium py-3 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-green-800/80 hover:to-green-700/80 flex items-center justify-between px-4"
          >
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
              <span>{displayAddress}</span>
            </div>
            <ChevronDown size={18} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
              <div className="p-3 border-b border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Connected Account</div>
                <div className="text-sm text-white font-mono flex items-center">
                  {displayAddress}
                  <a 
                    href={`https://sepolia.basescan.org/address/${account}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-green-400 hover:text-green-300"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <button 
                onClick={disconnectWallet}
                className="w-full p-3 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default WalletConnect;