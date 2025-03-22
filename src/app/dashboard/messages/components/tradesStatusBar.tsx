"use client";

import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle, DollarSign, Timer, Star, ArrowRight, RotateCcw, Shield, Wallet, Lock, Send, Unlock } from "lucide-react";

const TradeStatusBar = ({ initialStage = "initiate" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [tradeStatus, setTradeStatus] = useState({
    user: false,
    counterparty: false
  });
  const [userRating, setUserRating] = useState(0);
  const [counterpartyRating, setCounterpartyRating] = useState(0);
  // Add new state for trade details
  const [tradeDetails, setTradeDetails] = useState({
    tokenAddress: "",
    amount: "",
    buyerAddress: ""
  });
  // Add state for wallet connection
  const [walletConnected, setWalletConnected] = useState(false);

  // Update stage when prop changes
  useEffect(() => {
    setCurrentStage(initialStage);
  }, [initialStage]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  // Toggle user's acceptance status
  const toggleUserStatus = () => {
    setTradeStatus(prev => ({
      ...prev,
      user: !prev.user
    }));
  };
  
  // Toggle counterparty's acceptance status
  const toggleCounterpartyStatus = () => {
    setTradeStatus(prev => ({
      ...prev,
      counterparty: !prev.counterparty
    }));
  };

  // Mock function to connect wallet
  const connectWallet = () => {
    setWalletConnected(true);
  };

  // Handle trade detail input changes
  const handleTradeDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTradeDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mock function to advance to next stage - in production this would interact with your backend
  const proceedToNextStage = (nextStage: string) => {
    setCurrentStage(nextStage);
    closeModal();
  };

  // Determine the status bar text based on current stage
  const getStatusBarText = () => {
    switch(currentStage) {
      case "initiate":
        return tradeStatus.user && tradeStatus.counterparty 
          ? "Trade Initiated - Both Parties Accepted" 
          : "Awaiting Trade Acceptance";
      case "connect_wallet":
        return "Pending: Seller to Connect Wallet";
      case "lock_funds":
        return "Pending: Seller to Lock Funds";
      case "fiat_sent":
        return "Pending: Buyer to Confirm Fiat Payment Sent";
      case "release_funds":
        return "Pending: Seller to Release Funds";
      case "completed":
        return "Trade Completed Successfully";
      case "cancelled":
        return "Trade Cancelled - Crypto Returned";
      case "rate_experience":
        return "Trade Complete - Rate Your Experience";
      default:
        return "Trade Status";
    }
  };

  // Determine status color based on current stage
  const getStatusColor = () => {
    switch(currentStage) {
      case "initiate":
        return tradeStatus.user && tradeStatus.counterparty 
          ? "bg-green-500/20 border-green-500/50 text-green-400"
          : "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
      case "connect_wallet":
      case "lock_funds":
      case "fiat_sent":
      case "release_funds":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
      case "completed":
        return "bg-green-500/20 border-green-500/50 text-green-400";
      case "cancelled":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      case "rate_experience":
        return "bg-blue-500/20 border-blue-500/50 text-blue-400";
      default:
        return "bg-gray-800/70 border-gray-700";
    }
  };

  // Get icon for status bar
  const getStatusIcon = () => {
    switch(currentStage) {
      case "initiate":
        return tradeStatus.user && tradeStatus.counterparty 
          ? <Check size={18} className="text-green-400" />
          : <AlertCircle size={18} className="text-yellow-400" />;
      case "connect_wallet":
        return <Wallet size={18} className="text-yellow-400" />;
      case "lock_funds":
        return <Lock size={18} className="text-yellow-400" />;
      case "fiat_sent":
        return <DollarSign size={18} className="text-yellow-400" />;
      case "release_funds":
        return <Unlock size={18} className="text-yellow-400" />;
      case "completed":
        return <Check size={18} className="text-green-400" />;
      case "cancelled":
        return <X size={18} className="text-red-400" />;
      case "rate_experience":
        return <Star size={18} className="text-blue-400" />;
      default:
        return <AlertCircle size={18} className="text-gray-400" />;
    }
  };

  // Star rating component
  const StarRating = ({ rating, setRating, size = 24 }: { rating: number, setRating: (rating: number) => void, size?: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`cursor-pointer transition-colors ${
              star <= rating 
                ? "text-green-400 fill-green-400" 
                : "text-gray-500 hover:text-gray-400"
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };

  // Render different modal content based on current stage
  const renderModalContent = () => {
    switch(currentStage) {
      case "initiate":
        return (
          <div className="p-4 space-y-4">
            <div className="p-3 mb-2 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-center text-green-400">
                <Shield className="inline mr-1" size={16} />
                Escrow secured by smart contract - Funds held safely until trade completion
              </p>
            </div>
            
            <p className="text-gray-300 text-sm">Both parties must accept the trade for it to proceed.</p>
            
            {/* Your acceptance */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Your Acceptance</h4>
                  <p className="text-sm text-gray-400">Do you accept the terms of this trade?</p>
                </div>
                <button 
                  onClick={toggleUserStatus}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    tradeStatus.user 
                      ? "bg-green-500/20 border border-green-500/50 text-green-400" 
                      : "bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {tradeStatus.user ? "Accepted" : "Accept"}
                </button>
              </div>
            </div>
            
            {/* Counterparty acceptance */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Counterparty Acceptance</h4>
                  <p className="text-sm text-gray-400">Has the other party accepted the trade?</p>
                </div>
                <button 
                  onClick={toggleCounterpartyStatus}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    tradeStatus.counterparty 
                      ? "bg-green-500/20 border border-green-500/50 text-green-400" 
                      : "bg-gray-700 border border-gray-600 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {tradeStatus.counterparty ? "Accepted" : "Accept"}
                </button>
              </div>
            </div>
            
            {/* Current status and action button */}
            <div className="space-y-4">
              <div className={`p-3 rounded-lg text-center font-medium ${
                tradeStatus.user && tradeStatus.counterparty 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-yellow-500/20 text-yellow-400"
              }`}>
                {tradeStatus.user && tradeStatus.counterparty 
                  ? "Both parties have accepted - Ready to proceed" 
                  : "Waiting for acceptance from both parties"}
              </div>
              
              {tradeStatus.user && tradeStatus.counterparty && (
                <button 
                  onClick={() => proceedToNextStage("connect_wallet")}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
                >
                  Proceed to Next Step
                </button>
              )}
            </div>
          </div>
        );

      case "connect_wallet":
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Connect Wallet (Seller)</h4>
              
              <div className="p-3 mb-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-center text-blue-400">
                  <Wallet className="inline mr-1" size={16} />
                  Please connect your wallet to proceed with locking funds in the escrow contract
                </p>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">As the seller, you need to connect your wallet to lock the cryptocurrency in escrow.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => proceedToNextStage("cancelled")}
                  className="w-1/2 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel Trade
                </button>
                <button 
                  onClick={() => {
                    connectWallet();
                    proceedToNextStage("lock_funds");
                  }}
                  className="w-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-200"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        );

      case "lock_funds":
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Lock Funds in Escrow (Seller)</h4>
              
              <div className="p-3 mb-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-sm text-center text-green-400">
                  <Lock className="inline mr-1" size={16} />
                  Wallet Connected: {walletConnected ? "Yes" : "No"}
                </p>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Token Address</label>
                  <input 
                    type="text" 
                    name="tokenAddress"
                    value={tradeDetails.tokenAddress}
                    onChange={handleTradeDetailChange}
                    placeholder="0x..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount</label>
                  <input 
                    type="text" 
                    name="amount"
                    value={tradeDetails.amount}
                    onChange={handleTradeDetailChange}
                    placeholder="0.0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Buyer's Address</label>
                  <input 
                    type="text" 
                    name="buyerAddress"
                    value={tradeDetails.buyerAddress}
                    onChange={handleTradeDetailChange}
                    placeholder="0x..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">Please enter the details above and lock your funds in the escrow contract.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => proceedToNextStage("cancelled")}
                  className="w-1/2 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => proceedToNextStage("fiat_sent")}
                  className="w-1/2 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
                  disabled={!tradeDetails.tokenAddress || !tradeDetails.amount || !tradeDetails.buyerAddress}
                >
                  Lock Funds
                </button>
              </div>
            </div>
          </div>
        );

      case "fiat_sent":
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Payment Confirmation (Buyer)</h4>
              
              <div className="p-3 mb-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-center text-yellow-400">
                  <Timer className="inline mr-1" size={16} />
                  Payment must be sent within 1 hour or the trade will be cancelled
                </p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Payment Amount:</span>
                  <span className="text-sm text-white font-medium">$1,250 NZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Account Name:</span>
                  <span className="text-sm text-white font-medium">John Smith</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Account Number:</span>
                  <span className="text-sm text-white font-medium">12-3456-7890123-45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Reference:</span>
                  <span className="text-sm text-white font-medium">BTC-12345</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">Have you sent the payment to the account details above?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => proceedToNextStage("cancelled")}
                  className="w-1/2 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
                >
                  No, Cancel
                </button>
                <button 
                  onClick={() => proceedToNextStage("release_funds")}
                  className="w-1/2 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
                >
                  Yes, Payment Sent
                </button>
              </div>
            </div>
          </div>
        );

      case "release_funds":
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Release Funds (Seller)</h4>
              
              <div className="p-3 mb-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-center text-blue-400">
                  <AlertCircle className="inline mr-1" size={16} />
                  Buyer has confirmed payment sent. Please check your account.
                </p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Expected Amount:</span>
                  <span className="text-sm text-white font-medium">$1,250 NZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Buyer Name:</span>
                  <span className="text-sm text-white font-medium">Jane Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Reference:</span>
                  <span className="text-sm text-white font-medium">BTC-12345</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Token:</span>
                  <span className="text-sm text-white font-medium">{tradeDetails.amount} (from escrow)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Receiver:</span>
                  <span className="text-sm text-white font-medium truncate">{tradeDetails.buyerAddress || "0x..."}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">Have you received the payment in your account? If yes, please release the funds from escrow to complete the trade.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => proceedToNextStage("cancelled")}
                  className="w-1/2 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
                >
                  No, Not Received
                </button>
                <button 
                  onClick={() => proceedToNextStage("completed")}
                  className="w-1/2 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
                >
                  Release Funds
                </button>
              </div>
            </div>
          </div>
        );

      case "completed":
        return (
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <Check size={32} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Trade Completed Successfully!</h3>
              <p className="text-gray-300 text-sm mb-4">
                The escrow has been released and the trade is now complete.
              </p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Trade ID:</span>
                <span className="text-sm text-white font-medium">T12345-BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Asset:</span>
                <span className="text-sm text-white font-medium">{tradeDetails.amount || "0.025 BTC"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Value:</span>
                <span className="text-sm text-white font-medium">$1,250 NZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Transaction Hash:</span>
                <span className="text-sm text-white font-medium truncate">0x1a2b...3c4d</span>
              </div>
            </div>
            
            <button 
              onClick={() => proceedToNextStage("rate_experience")}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
            >
              Rate Your Experience
            </button>
          </div>
        );

      case "cancelled":
        return (
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                <X size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Trade Cancelled</h3>
              <p className="text-gray-300 text-sm mb-4">
                The trade has been cancelled and any locked crypto has been returned to the seller.
              </p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Trade ID:</span>
                <span className="text-sm text-white font-medium">T12345-BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Cancellation Reason:</span>
                <span className="text-sm text-white font-medium">Payment not received</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Status:</span>
                <span className="text-sm text-red-400 font-medium">Funds returned to seller</span>
              </div>
            </div>
            
            <button 
              onClick={closeModal}
              className="w-full bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
            >
              Close
            </button>
          </div>
        );

      case "rate_experience":
        return (
          <div className="p-4 space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Rate Your Experience</h3>
              <p className="text-gray-300 text-sm">
                Please rate your trading experience to help build trust in the community.
              </p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3">Rate Counterparty</h4>
              <div className="flex justify-center mb-4">
                <StarRating rating={counterpartyRating} setRating={setCounterpartyRating} />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Add a comment (optional)</label>
                <textarea 
                  className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                  rows={3}
                  placeholder="Share your experience with this trader..."
                ></textarea>
              </div>
            </div>
            
            <button 
              onClick={closeModal}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
            >
              Submit Rating
            </button>
          </div>
        );

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-gray-300">Unknown stage: {currentStage}</p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Trade Status Bar - Updated styling */}
      <div className="relative w-full px-4">
        <div 
          className={`max-w-3xl mx-auto backdrop-blur-sm rounded-lg border shadow-[0_0_15px_rgba(34,197,94,0.2)] p-3 cursor-pointer transition-all duration-200 ${getStatusColor()}`}
          onClick={openModal}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusBarText()}</span>
            </div>
            <span className="text-sm text-gray-400">Click to update</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] w-full max-w-md">
            <div className="flex items-center justify-between border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white">Trade Status</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {renderModalContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default TradeStatusBar;