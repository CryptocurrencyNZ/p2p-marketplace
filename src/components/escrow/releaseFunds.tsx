import React, { useState } from "react";
import { ethers, Signer, ContractTransactionResponse } from "ethers";
import { ESCROW_ABI, ESCROW_ADDRESS } from "@/constants";
import { Unlock, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

// this component is to release the crypto to the buyer (step 3)
interface ReleaseFundsProps {
  signer: Signer | null;
}

// Define status object type
type StatusType = {
  type: "" | "error" | "success" | "warning" | "loading";
  message: string;
};

function ReleaseFunds({ signer }: ReleaseFundsProps): React.ReactElement {
  // we should dynamically pass the tradeID into this (needs to stay the same through the flow)
  const [tradeId, setTradeId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusType>({ type: "", message: "" });

  const handleTradeIdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Only allow positive numbers
    if (e.target.value === "" || Number(e.target.value) >= 0) {
      setTradeId(e.target.value);
    }
  };

  async function releaseFunds(): Promise<void> {
    if (!signer) {
      setStatus({
        type: "error",
        message: "Please connect your wallet first"
      });
      return;
    }

    if (!tradeId) {
      setStatus({
        type: "error",
        message: "Please enter a valid Trade ID"
      });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: "loading", message: "Processing transaction..." });
      
      const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
      
      setStatus({
        type: "loading",
        message: `Releasing funds for Trade ID ${tradeId}...`
      });
      
      const tx = await contract.releaseFunds(tradeId);
      await tx.wait();
      
      setStatus({
        type: "success",
        message: `Funds released successfully for Trade ID: ${tradeId}`
      });
      
      // Reset form on success
      setTradeId("");
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
          <Unlock size={20} className="text-green-400" />
        </div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text">
          Release Funds
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
          <label className="block text-sm font-medium text-gray-300" htmlFor="release-trade-id">
            Trade ID
          </label>
          <input
            id="release-trade-id"
            type="number"
            placeholder="Enter Trade ID"
            value={tradeId}
            onChange={handleTradeIdChange}
            min="0"
            step="1"
            className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
          />
        </div>

        <button
          onClick={releaseFunds}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Release funds for this trade"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Release Funds
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ReleaseFunds;