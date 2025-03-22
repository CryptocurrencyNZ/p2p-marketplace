"use client";

import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle, DollarSign, Timer, Star, ArrowRight, RotateCcw, Shield, Wallet, Lock, Send, Unlock } from "lucide-react";

// Define the type for the session data
interface TradeSessionData {
  id: string;
  vendor_start: boolean;
  customer_start: boolean;
  vendor_id: string;
  customer_id: string;
  vendor_complete: string | null;
  customer_complete: string | null;
  vendor_wallet: string | null;
  customer_wallet: string | null;
  stage?: string;
  // Add other session fields as needed
}

interface TradeStatusBarProps {
  initialStage?: string;
  sessionId?: string;
}

const TradeStatusBar = ({ initialStage = "initiate", sessionId }: TradeStatusBarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [tradeStatus, setTradeStatus] = useState({
    user: false,
    counterparty: false
  });
  const [sessionData, setSessionData] = useState<TradeSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [counterpartyRating, setCounterpartyRating] = useState(0);
  const [isVendor, setIsVendor] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Fetch trade session status
  useEffect(() => {
    if (!sessionId) return;

    const fetchTradeSessionStatus = async () => {
      try {
        setLoading(true);
        
        // Fetch start status data
        const response = await fetch(`/api/trade-sessions/start-status?sessionId=${sessionId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch trade session status");
        }
        
        const data = await response.json();
        setSessionData(data);
        
        // Check if current user is the vendor (seller) or buyer
        const userSession = await fetch('/api/auth/session');
        if (userSession.ok) {
          const userData = await userSession.json();
          const currentUserId = userData.user?.id;
          
          // Determine if current user is vendor or buyer
          const userIsVendor = data.vendor_id === currentUserId;
          setIsVendor(userIsVendor);
          
          // Update component state based on session data and user role
          if (userIsVendor) {
            setTradeStatus(prev => ({
              ...prev,
              user: data.vendor_start,
              counterparty: data.customer_start
            }));
            
            // Set wallet address if available
            if (data.vendor_wallet) {
              setWalletAddress(data.vendor_wallet);
            }
          } else {
            setTradeStatus(prev => ({
              ...prev,
              user: data.customer_start,
              counterparty: data.vendor_start
            }));
            
            // Set wallet address if available
            if (data.customer_wallet) {
              setWalletAddress(data.customer_wallet);
            }
          }
          
          // Set current stage from data if available
          if (data.stage) {
            setCurrentStage(data.stage);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching trade session status:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchTradeSessionStatus();
    
    // Set up polling for status updates
    const intervalId = setInterval(fetchTradeSessionStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, [sessionId]);

  // Update the start status API
  const updateTradeSessionStatus = async (status: boolean) => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/trade-sessions/start-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          status,
          userRole: isVendor ? 'vendor' : 'buyer'
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update trade session status");
      }
      
      const data = await response.json();
      setSessionData(data[0]); // Update with the returned data
      
    } catch (err) {
      console.error("Error updating trade session status:", err);
    }
  };
  
  // Update the complete status API
  const updateCompleteStatus = async (status: "-1" | "0" | "1") => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/trade-sessions/complete-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          status
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update complete status");
      }
      
      const data = await response.json();
      setSessionData(data[0]);
      
    } catch (err) {
      console.error("Error updating complete status:", err);
    }
  };
  
  // Update the wallet status API
  const updateWalletStatus = async (wallet: string) => {
    if (!sessionId || !wallet.trim()) return;
    
    try {
      const response = await fetch('/api/trade-sessions/wallet-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          wallet
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update wallet status");
      }
      
      const data = await response.json();
      setSessionData(data[0]);
      setWalletAddress(wallet);
      
    } catch (err) {
      console.error("Error updating wallet status:", err);
    }
  };

  // Update stage when prop changes
  useEffect(() => {
    setCurrentStage(initialStage);
  }, [initialStage]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  // Toggle user's acceptance status
  const toggleUserStatus = () => {
    const newStatus = !tradeStatus.user;
    setTradeStatus(prev => ({
      ...prev,
      user: newStatus
    }));
    updateTradeSessionStatus(newStatus);
  };
  
  // Toggle counterparty's acceptance status
  const toggleCounterpartyStatus = async () => {
    const newStatus = !tradeStatus.counterparty;
    setTradeStatus(prev => ({
      ...prev,
      counterparty: newStatus
    }));
    
    // This is just for UI representation, the actual counterparty status 
    // would be set by the counterparty themselves via their own session
  };

  // Function to advance to next stage - now interacts with backend
  const proceedToNextStage = async (nextStage: string) => {
    try {
      // Different API calls based on the stage transition
      if (currentStage === "initiate" && nextStage === "confirm_details") {
        // Call start-status API to officially start the trade
        await fetch('/api/trade-sessions/start-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            status: true,
            userRole: isVendor ? 'vendor' : 'buyer',
            stage: nextStage
          }),
        });
      } 
      else if (nextStage === "fiat_sent") {
        // If buyer confirms sending payment
        if (!isVendor) {
          await updateCompleteStatus("1");
        }
      }
      else if (nextStage === "confirm_received") {
        // If buyer confirms sending payment
        if (!isVendor) {
          await updateCompleteStatus("1");
        }
      }
      else if (nextStage === "completed") {
        // If seller confirms receiving payment
        if (isVendor) {
          await updateCompleteStatus("1");
        }
      }
      else if (nextStage === "cancelled") {
        // For cancellations
        await updateCompleteStatus("-1");
      }
      
      // Update the stage in the DB and locally
      await fetch('/api/trade-sessions/start-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status: true, // Keep current status
          userRole: isVendor ? 'vendor' : 'buyer',
          stage: nextStage
        }),
      });
      
      // Update the UI
      setCurrentStage(nextStage);
      closeModal();
    } catch (err) {
      console.error(`Error transitioning to stage ${nextStage}:`, err);
    }
  };

  // Handler for wallet address input
  const handleWalletAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(event.target.value);
  };
  
  // Save wallet address
  const saveWalletAddress = async () => {
    await updateWalletStatus(walletAddress);
  };

  // Determine the status bar text based on current stage and roles
  const getStatusBarText = () => {
    switch(currentStage) {
      case "initiate":
        if (isVendor) {
          return tradeStatus.user && tradeStatus.counterparty 
            ? "Trade Initiated - Both Parties Accepted" 
            : "Awaiting Buyer Acceptance";
        } else {
          return tradeStatus.user && tradeStatus.counterparty 
            ? "Trade Initiated - Both Parties Accepted" 
            : "Awaiting Seller Acceptance";
        }
      case "confirm_details":
        return isVendor 
          ? "Waiting: Buyer to Confirm Trade Details" 
          : "Buyer: Confirm Trade Details";
      case "fiat_sent":
        return isVendor 
          ? "Waiting: Buyer to Send Payment" 
          : "Pending: Confirm Fiat Payment Sent";
      case "confirm_received":
        return isVendor 
          ? "Pending: Confirm Payment Received" 
          : "Waiting: Seller to Confirm Payment";
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

  // Get role-specific label for the status display
  const getRoleLabel = () => {
    return isVendor ? "(Seller)" : "(Buyer)";
  };

  // Get counterparty role label for the status display
  const getCounterpartyRoleLabel = () => {
    return isVendor ? "(Buyer)" : "(Seller)";
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
                  <h4 className="font-medium text-white">Your Acceptance {getRoleLabel()}</h4>
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
              
              {/* Display status from API if session data is loaded */}
              {sessionData && (
                <div className="mt-2 text-xs text-gray-400">
                  Status: {isVendor 
                    ? sessionData.vendor_start ? "Accepted" : "Not Accepted"
                    : sessionData.customer_start ? "Accepted" : "Not Accepted"
                  } by you {getRoleLabel()}
                </div>
              )}
            </div>
            
            {/* Counterparty acceptance */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Counterparty Acceptance {getCounterpartyRoleLabel()}</h4>
                  <p className="text-sm text-gray-400">{isVendor ? "Buyer" : "Seller"} status:</p>
                </div>
                <div 
                  className={`px-4 py-2 rounded-lg font-medium ${
                    tradeStatus.counterparty 
                      ? "bg-green-500/20 border border-green-500/50 text-green-400" 
                      : "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                  }`}
                >
                  {tradeStatus.counterparty ? "Accepted" : "Waiting"}
                </div>
              </div>
              {sessionData && (
                <div className="mt-2 text-xs text-gray-400">
                  Status: {isVendor 
                    ? sessionData.customer_start ? "Accepted" : "Not Accepted"
                    : sessionData.vendor_start ? "Accepted" : "Not Accepted"
                  } by counterparty {getCounterpartyRoleLabel()}
                </div>
              )}
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
                  : `Waiting for acceptance from ${!tradeStatus.user ? "you" : isVendor ? "buyer" : "seller"}`}
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

      case "confirm_details":
        // Only buyers should see this stage with active options
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">
                Trade Details {isVendor ? "(Waiting for Buyer)" : "(Buyer Confirmation)"}
              </h4>
              
              <div className="p-3 mb-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-center text-blue-400">
                  <Wallet className="inline mr-1" size={16} />
                  Please connect your wallet to proceed with locking funds in the escrow contract
                </p>
              </div>
              
              {/* Wallet Address Input - Buyer needs to provide their wallet to receive crypto */}
              {!isVendor && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Your Wallet Address (to receive crypto)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={walletAddress}
                      onChange={handleWalletAddressChange}
                      placeholder="Enter your wallet address"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                    />
                    <button 
                      onClick={saveWalletAddress}
                      className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-500/30"
                    >
                      Save
                    </button>
                  </div>
                  {sessionData?.customer_wallet && (
                    <p className="text-xs text-green-400 mt-1">Wallet address saved!</p>
                  )}
                </div>
              )}
              
              {/* Seller sees buyer's wallet address if provided */}
              {isVendor && sessionData?.customer_wallet && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Buyer's Wallet Address:</p>
                  <p className="text-sm text-white font-mono bg-gray-700/50 p-2 rounded-md mt-1 break-all">
                    {sessionData.customer_wallet}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-gray-300 mb-4">
                {isVendor 
                 ? "Waiting for buyer to confirm trade details." 
                 : "Please carefully review the trade details above before proceeding."}
              </p>
              
              {!isVendor && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => proceedToNextStage("cancelled")}
                    className="w-1/2 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel Trade
                  </button>
                  <button 
                    onClick={() => proceedToNextStage("fiat_sent")}
                    disabled={!walletAddress.trim()}
                    className={`w-1/2 font-medium rounded-lg px-4 py-2 transition-all duration-200 ${
                      !walletAddress.trim()
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-500 text-gray-900 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    }`}
                  >
                    Confirm Details
                  </button>
                </div>
              )}
              
              {isVendor && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                  <p className="text-sm text-blue-400">
                    <Timer className="inline mr-1" size={16} />
                    Waiting for buyer to confirm details
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "fiat_sent":
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Payment Confirmation {isVendor ? "(Waiting for Buyer)" : "(Buyer)"}</h4>
              
              <div className="p-3 mb-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-center text-yellow-400">
                  <Timer className="inline mr-1" size={16} />
                  Payment must be sent within 1 hour or the trade will be cancelled
                </p>
              </div>
              
              {/* Payment details - Usually provided by the seller */}
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
              
              {/* Wallet confirmation for buyer */}
              {!isVendor && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Your Crypto Will Be Sent To:</p>
                  <p className="text-sm text-white font-mono bg-gray-700/50 p-2 rounded-md mt-1 break-all">
                    {walletAddress || sessionData?.customer_wallet || "No wallet address provided"}
                  </p>
                  
                  {(!walletAddress && !sessionData?.customer_wallet) && (
                    <div className="mt-2">
                      <label className="block text-sm text-gray-400 mb-1">Your Wallet Address</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={walletAddress}
                          onChange={handleWalletAddressChange}
                          placeholder="Enter your wallet address"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                        />
                        <button 
                          onClick={saveWalletAddress}
                          className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-500/30"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Seller UI - Show status of buyer payment */}
              {isVendor && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center mb-4">
                  <p className="text-sm text-blue-400">
                    <Timer className="inline mr-1" size={16} />
                    Waiting for buyer to send payment
                  </p>
                </div>
              )}
              
              {/* Buyer UI - Confirm payment has been sent */}
              {!isVendor && (
                <>
                  <p className="text-sm text-gray-300 mb-4">Have you sent the payment to the account details above?</p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => proceedToNextStage("cancelled")}
                      className="w-1/2 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
                    >
                      No, Cancel
                    </button>
                    <button 
                      onClick={() => proceedToNextStage("confirm_received")}
                      disabled={!walletAddress && !sessionData?.customer_wallet}
                      className={`w-1/2 font-medium rounded-lg px-4 py-2 transition-all duration-200 ${
                        !walletAddress && !sessionData?.customer_wallet
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-500 text-gray-900 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      }`}
                    >
                      Yes, Payment Sent
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case "release_funds":
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Payment Confirmation {isVendor ? "(Seller)" : "(Waiting for Seller)"}</h4>
              
              <div className="p-3 mb-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-center text-blue-400">
                  <AlertCircle className="inline mr-1" size={16} />
                  {isVendor ? "Buyer has confirmed payment sent. Please check your account." : "Waiting for seller to confirm payment received."}
                </p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Expected Amount:</span>
                  <span className="text-sm text-white font-medium">$1,250 NZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">{isVendor ? "Buyer" : "Your"} Name:</span>
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
              
              {/* Seller inputs wallet address if not yet provided */}
              {isVendor && !sessionData?.vendor_wallet && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Your Wallet Address (sending from)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={walletAddress}
                      onChange={handleWalletAddressChange}
                      placeholder="Enter your wallet address"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                    />
                    <button 
                      onClick={saveWalletAddress}
                      className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-500/30"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
              
              {/* Display both wallet addresses if available */}
              {sessionData?.vendor_wallet && sessionData?.customer_wallet && (
                <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-3 mb-4 space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Seller Wallet (sending from):</p>
                    <p className="text-xs text-white font-mono bg-gray-700/50 p-1.5 rounded-md break-all">
                      {sessionData.vendor_wallet}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Buyer Wallet (sending to):</p>
                    <p className="text-xs text-white font-mono bg-gray-700/50 p-1.5 rounded-md break-all">
                      {sessionData.customer_wallet}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Only seller can confirm receipt */}
              {isVendor && (
                <>
                  <p className="text-sm text-gray-300 mb-4">Have you received the payment in your account?</p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => proceedToNextStage("cancelled")}
                      className="w-1/2 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
                    >
                      No, Not Received
                    </button>
                    <button 
                      onClick={() => proceedToNextStage("completed")}
                      disabled={!sessionData?.vendor_wallet}
                      className={`w-1/2 font-medium rounded-lg px-4 py-2 transition-all duration-200 ${
                        !sessionData?.vendor_wallet
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-500 text-gray-900 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      }`}
                    >
                      Yes, Payment Received
                    </button>
                  </div>
                </>
              )}
              
              {/* Buyer just sees waiting message */}
              {!isVendor && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                  <p className="text-sm text-blue-400">
                    <Timer className="inline mr-1" size={16} />
                    Waiting for seller to confirm payment received
                  </p>
                </div>
              )}
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
                <span className="text-sm text-white font-medium">{sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Asset:</span>
                <span className="text-sm text-white font-medium">{tradeDetails.amount || "0.025 BTC"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Value:</span>
                <span className="text-sm text-white font-medium">$1,250 NZD</span>
              </div>
              
              {/* Transaction wallet details */}
              {sessionData?.vendor_wallet && sessionData?.customer_wallet && (
                <>
                  <div className="pt-2 border-t border-gray-700 mt-2">
                    <p className="text-sm text-gray-400 mb-1">Transaction Details:</p>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">From (Seller):</p>
                        <p className="text-xs text-white font-mono bg-gray-700/50 p-1.5 rounded-md break-all">
                          {sessionData.vendor_wallet}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">To (Buyer):</p>
                        <p className="text-xs text-white font-mono bg-gray-700/50 p-1.5 rounded-md break-all">
                          {sessionData.customer_wallet}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
                <span className="text-sm text-white font-medium">{sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Cancellation Reason:</span>
                <span className="text-sm text-white font-medium">
                  {sessionData?.vendor_complete === "-1" 
                    ? "Cancelled by seller" 
                    : sessionData?.customer_complete === "-1" 
                      ? "Cancelled by buyer" 
                      : "Payment not received"}
                </span>
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
        // Handler for submitting rating
        const handleSubmitRating = async () => {
          try {
            // Submit the rating via the complete status API with "1" for success
            await updateCompleteStatus("1");
            closeModal();
          } catch (err) {
            console.error("Error submitting rating:", err);
          }
        };
        
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
              onClick={handleSubmitRating}
              disabled={counterpartyRating === 0}
              className={`w-full font-medium rounded-lg px-4 py-2 transition-all duration-200 ${
                counterpartyRating === 0
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-500 text-gray-900 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
              }`}
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
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-400 border-t-transparent"></div>
              ) : (
                getStatusIcon()
              )}
              <span className="font-medium">
                {loading ? "Loading trade status..." : getStatusBarText()}
                {!loading && sessionData && (
                  <span className="text-xs ml-2 opacity-80">
                    {getRoleLabel()} {getCounterpartyRoleLabel()}
                  </span>
                )}
              </span>
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