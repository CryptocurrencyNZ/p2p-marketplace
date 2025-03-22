"use client";

import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle, DollarSign, Timer, Star, ArrowRight, RotateCcw, Shield } from "lucide-react";

// Define the type for the session data
interface TradeSessionData {
  id: string;
  vendor_start: boolean;
  buyer_start?: boolean;
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

  // Fetch trade session status
  useEffect(() => {
    if (!sessionId) return;

    const fetchTradeSessionStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trade-sessions/start-status?sessionId=${sessionId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch trade session status");
        }
        
        const data = await response.json();
        setSessionData(data);
        
        // Update component state based on session data
        if (data.vendor_start !== undefined) {
          setTradeStatus(prev => ({
            ...prev,
            user: data.vendor_start
          }));
        }
        
        // Here you can update other states based on the session data
        
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

  // Update the API when status changes
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
          status
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update trade session status");
      }
      
      const data = await response.json();
      setSessionData(data[0]); // Update with the returned data
      
    } catch (err) {
      console.error("Error updating trade session status:", err);
      // You might want to handle this error in the UI
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
    
    // Only update the API if we have a sessionId
    if (sessionId) {
      try {
        const response = await fetch('/api/trade-sessions/start-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            status: newStatus,
            isCounterparty: true // Flag to indicate this is the counterparty's status
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to update counterparty status");
        }
        
        const data = await response.json();
        setSessionData(data[0]); // Update with the returned data
      } catch (err) {
        console.error("Error updating counterparty status:", err);
        // Reset state if the API call fails
        setTradeStatus(prev => ({
          ...prev,
          counterparty: !newStatus
        }));
      }
    }
  };

  // Mock function to advance to next stage - in production this would interact with your backend
  const proceedToNextStage = async (nextStage: string) => {
    // If we're moving from initiate to confirm_details, this represents starting the trade
    if (currentStage === "initiate" && nextStage === "confirm_details") {
      try {
        // Call the API to officially start the trade
        const response = await fetch('/api/trade-sessions/start-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            status: true  // true indicates the trade is starting
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to start trade");
        }
        
        // Update the stage only if API call was successful
        setCurrentStage(nextStage);
        closeModal();
      } catch (err) {
        console.error("Error starting trade:", err);
        // You could show an error message to the user here
      }
    } else {
      // For other stage transitions, simply update the UI
      setCurrentStage(nextStage);
      closeModal();
    }
  };

  // Determine the status bar text based on current stage
  const getStatusBarText = () => {
    switch(currentStage) {
      case "initiate":
        return tradeStatus.user && tradeStatus.counterparty 
          ? "Trade Initiated - Both Parties Accepted" 
          : "Awaiting Trade Acceptance";
      case "confirm_details":
        return "Buyer: Confirm Trade Details";
      case "fiat_sent":
        return "Pending: Buyer to Confirm Fiat Payment Sent";
      case "confirm_received":
        return "Pending: Seller to Confirm Payment Received";
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
      case "confirm_details":
      case "fiat_sent":
      case "confirm_received":
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
      case "confirm_details":
        return <AlertCircle size={18} className="text-yellow-400" />;
      case "fiat_sent":
        return <DollarSign size={18} className="text-yellow-400" />;
      case "confirm_received":
        return <Timer size={18} className="text-yellow-400" />;
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
              
              {/* Display status from API if session data is loaded */}
              {sessionData && (
                <div className="mt-2 text-xs text-gray-400">
                  Status: {sessionData.vendor_start ? "Accepted" : "Not Accepted"} by vendor
                </div>
              )}
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
                  onClick={() => proceedToNextStage("confirm_details")}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
                >
                  Proceed to Next Step
                </button>
              )}
            </div>
          </div>
        );

      case "confirm_details":
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Trade Details (Buyer Confirmation)</h4>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Asset:</span>
                  <span className="text-sm text-white font-medium">Bitcoin (BTC)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Amount:</span>
                  <span className="text-sm text-white font-medium">0.025 BTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Fiat Price:</span>
                  <span className="text-sm text-white font-medium">$1,250 NZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Payment Method:</span>
                  <span className="text-sm text-white font-medium">Bank Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Escrow Status:</span>
                  <span className="text-sm text-green-400 font-medium">Funds Secured</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">Please carefully review the trade details above before proceeding.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => proceedToNextStage("cancelled")}
                  className="w-1/2 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel Trade
                </button>
                <button 
                  onClick={() => proceedToNextStage("fiat_sent")}
                  className="w-1/2 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
                >
                  Confirm Details
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
                  onClick={() => proceedToNextStage("confirm_received")}
                  className="w-1/2 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
                >
                  Yes, Payment Sent
                </button>
              </div>
            </div>
          </div>
        );

      case "confirm_received":
        return (
          <div className="p-4 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Payment Confirmation (Seller)</h4>
              
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
              </div>
              
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
                  className="w-1/2 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] px-4 py-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-200"
                >
                  Yes, Payment Received
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
                <span className="text-sm text-white font-medium">0.025 BTC</span>
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
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-400 border-t-transparent"></div>
              ) : (
                getStatusIcon()
              )}
              <span className="font-medium">
                {loading ? "Loading trade status..." : getStatusBarText()}
                {!loading && sessionData && (
                  <span className="text-xs ml-2 opacity-80">
                    {sessionData.vendor_start ? "(Vendor accepted)" : "(Awaiting vendor)"}
                  </span>
                )}
              </span>
            </div>
            <span className="text-sm text-gray-400">Click to update</span>
          </div>
        </div>
      </div>

      {/* Modal remains unchanged */}
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