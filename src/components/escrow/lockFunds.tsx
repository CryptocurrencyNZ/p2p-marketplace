import React, { useState } from "react";
import { ethers, Signer, ContractTransactionResponse } from "ethers";
import { ESCROW_ABI, ESCROW_ADDRESS } from "@/constants";
import { Lock, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

// this component locks the crypto in the escrow (Step 1)

// Define types for component props
interface LockFundsProps {
  signer: Signer | null;
}

// Define status object type
type StatusType = {
  type: "" | "error" | "success" | "warning" | "loading";
  message: string;
};

// ERC20 Interface with only the methods we need
interface ERC20Interface {
  approve(spender: string, amount: bigint): Promise<ContractTransactionResponse>;
  balanceOf(owner: string): Promise<bigint>;
  totalSupply(): Promise<bigint>;
}

function LockFunds({ signer }: LockFundsProps): React.ReactElement {
  const [buyer, setBuyer] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusType>({ type: "", message: "" });

  const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setBuyer(e.target.value);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setToken(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Only allow positive numbers
    if (e.target.value === "" || Number(e.target.value) >= 0) {
      setAmount(e.target.value);
    }
  };

  async function approveAndLockFunds(): Promise<void> {
    if (!signer) {
      setStatus({
        type: "error",
        message: "Please connect your wallet first"
      });
      return;
    }

    if (!buyer || !amount || !token) {
      setStatus({
        type: "error",
        message: "Please enter Buyer Address, Token Address, and Amount"
      });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: "loading", message: "Processing transaction..." });
      
      const amountInWei = ethers.parseUnits(amount, 18);
      const address = await signer.getAddress();
      
      // Ensure valid ERC-20 token
      const tokenContract = new ethers.Contract(
        token,
        [
          "function approve(address spender, uint256 amount) public returns (bool)", 
          "function balanceOf(address owner) view returns (uint256)", 
          "function totalSupply() view returns (uint256)"
        ],
        signer
      ) as unknown as ERC20Interface;

      // Verify ERC-20 contract
      try {
        await tokenContract.totalSupply();
      } catch (e) {
        setStatus({
          type: "error",
          message: "Invalid Token Contract: The provided address is not an ERC-20 token."
        });
        setLoading(false);
        return;
      }

      // Check balance
      const balance = await tokenContract.balanceOf(address);
      if (balance < amountInWei) {
        setStatus({
          type: "error",
          message: "Insufficient token balance!"
        });
        setLoading(false);
        return;
      }

      setStatus({
        type: "loading",
        message: `Approving ${amount} tokens for escrow...`
      });
      
      const approveTx = await tokenContract.approve(ESCROW_ADDRESS, amountInWei);
      await approveTx.wait();
      
      setStatus({
        type: "success",
        message: "Approval successful! Locking funds in escrow..."
      });

      // Lock Funds in Escrow
      const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
      
      setStatus({
        type: "loading",
        message: `Locking ${amount} tokens in escrow for buyer ${buyer}...`
      });
      
      const tx = await contract.lockFunds(buyer, token, amountInWei);
      const receipt = await tx.wait();
      
      // Extract Trade ID from event logs
      const event = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === "FundsLocked";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        const tradeId = parsedEvent?.args.tradeId.toString();
        
        setStatus({
          type: "success",
          message: `Trade Locked! Trade ID: ${tradeId}`
        });
        
        // Reset form on success
        setBuyer("");
        setAmount("");
        setToken("");
      } else {
        setStatus({
          type: "warning",
          message: "Trade Locked, but could not retrieve Trade ID."
        });
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setStatus({
        type: "error",
        message: `Error: ${error.reason || error.message || "Transaction failed"}`
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="backdrop-blur-sm bg-gray-800/90 border border-gray-700 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] p-6">
      <div className="flex items-center mb-4">
        <div className="bg-green-500/20 p-2 rounded-full mr-3">
          <Lock size={20} className="text-green-400" />
        </div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text">
          Lock Funds in Escrow
        </h2>
      </div>

      {status.message && (
        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
          status.type === "error" ? "bg-red-900/20 border border-red-700/50 text-red-400" :
          status.type === "success" ? "bg-green-900/20 border border-green-700/50 text-green-400" :
          status.type === "warning" ? "bg-yellow-900/20 border border-yellow-700/50 text-yellow-400" :
          "bg-gray-700/50 border border-gray-600 text-gray-300"
        }`}>
          {status.type === "error" ? <AlertTriangle size={18} /> :
           status.type === "success" ? <CheckCircle size={18} /> :
           status.type === "warning" ? <AlertTriangle size={18} /> :
           <div className="animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full mr-1" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300" htmlFor="buyer-address">
            Buyer Address
          </label>
          <input
            id="buyer-address"
            type="text"
            placeholder="0x..."
            value={buyer}
            onChange={handleBuyerChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300" htmlFor="token-address">
            Token Address
          </label>
          <input
            id="token-address"
            type="text"
            placeholder="0x..."
            value={token}
            onChange={handleTokenChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300" htmlFor="token-amount">
            Amount
          </label>
          <input
            id="token-amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={handleAmountChange}
            min="0"
            step="any"
            className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
          />
        </div>

        <button
          onClick={approveAndLockFunds}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Approve and lock funds in escrow"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Approve & Lock Funds
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default LockFunds;