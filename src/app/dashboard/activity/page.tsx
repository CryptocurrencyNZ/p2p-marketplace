"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";

const ActivityPage = () => {
  // State for filters
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [mounted, setMounted] = useState(false);

  // Add useEffect to handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  type TransactionType = "buy" | "sell" | "send" | "receive" | "swap";
  type TransactionStatus = "completed" | "pending" | "failed";

  type Counterparty = {
    name: string;
    address: string;
  };

  type Transaction = {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    timestamp: Date;
    txHash?: string;
  } & (
    | {
        type: "buy" | "sell";
        currency: string;
        amount: number;
        fiatAmount: number;
        fiatCurrency: string;
        counterparty: Counterparty;
      }
    | {
        type: "send";
        currency: string;
        amount: number;
        recipient: Counterparty;
      }
    | {
        type: "receive";
        currency: string;
        amount: number;
        sender: Counterparty;
      }
    | {
        type: "swap";
        fromCurrency: string;
        fromAmount: number;
        toCurrency: string;
        toAmount: number;
      }
  ) & { failureReason?: string };

  // Usage in state
  const [transactions] = useState<Transaction[]>([
    {
      id: "t1",
      type: "buy",
      status: "completed",
      currency: "BTC",
      amount: 0.025,
      fiatAmount: 1250.0,
      fiatCurrency: "NZD",
      timestamp: new Date(2025, 2, 18, 14, 30),
      counterparty: {
        name: "Alice Crypto",
        address: "0xF3b217A5F7A9a4D",
      },
      txHash: "0x8a7d8f234c9a2b1d6f8e7c6b5a4c3d2e1f0",
    },
    {
      id: "t2",
      type: "sell",
      status: "completed",
      currency: "ETH",
      amount: 1.5,
      fiatAmount: 3600.0,
      fiatCurrency: "NZD",
      timestamp: new Date(2025, 2, 15, 9, 45),
      counterparty: {
        name: "Bob Blockchain",
        address: "0x7D1c43A8C2E53e5F",
      },
      txHash: "0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3",
    },
    {
      id: "t3",
      type: "send",
      status: "completed",
      currency: "BTC",
      amount: 0.075,
      timestamp: new Date(2025, 2, 12, 18, 20),
      recipient: {
        name: "Carol Coinbase",
        address: "0x4A9d6B2c8E7F3B2e",
      },
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7",
    },
    {
      id: "t4",
      type: "receive",
      status: "completed",
      currency: "ETH",
      amount: 0.8,
      timestamp: new Date(2025, 2, 10, 11, 15),
      sender: {
        name: "Dave DeFi",
        address: "0x2E6b9F1c8D7a4B3e",
      },
      txHash: "0xf1e2d3c4b5a6978d8e9f0a1b2c3d4e5f6",
    },
    {
      id: "t5",
      type: "swap",
      status: "completed",
      fromCurrency: "BTC",
      fromAmount: 0.012,
      toCurrency: "ETH",
      toAmount: 0.18,
      timestamp: new Date(2025, 2, 8, 15, 30),
      txHash: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4",
    },
    {
      id: "t6",
      type: "buy",
      status: "pending",
      currency: "ETH",
      amount: 0.5,
      fiatAmount: 1200.0,
      fiatCurrency: "NZD",
      timestamp: new Date(2025, 2, 5, 10, 0),
      counterparty: {
        name: "Eve Ethereum",
        address: "0x9C3a4D7e2B1f8D2b",
      },
    },
    {
      id: "t7",
      type: "send",
      status: "failed",
      currency: "BTC",
      amount: 0.03,
      timestamp: new Date(2025, 2, 1, 13, 45),
      recipient: {
        name: "Frank Fintech",
        address: "0x5B4c3D2e1F0A9b8C7",
      },
      failureReason: "Insufficient funds for gas",
    },
  ]);

  // Function to get the appropriate icon for transaction type
  const getTransactionIcon = (type: string, status: string) => {
    if (status === "failed") {
      return <XCircle size={20} className="text-red-500" />;
    }
    if (status === "pending") {
      return <Clock size={20} className="text-yellow-500" />;
    }

    switch (type) {
      case "buy":
        return <ArrowDown size={20} className="text-green-500" />;
      case "sell":
        return <ArrowUp size={20} className="text-red-400" />;
      case "send":
        return <ArrowUp size={20} className="text-blue-400" />;
      case "receive":
        return <ArrowDown size={20} className="text-green-500" />;
      case "swap":
        return <RefreshCw size={20} className="text-purple-400" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  // Function to get status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 flex items-center">
            <CheckCircle size={12} className="mr-1" /> Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 flex items-center">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 flex items-center">
            <XCircle size={12} className="mr-1" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  // Function to get formatted date
  const formatDate = (date: Date): string => {
    if (!mounted) return "";
    
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays < 7) {
      return `${date.toLocaleDateString([], { weekday: "long" })}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  // Function to get formatted description
  const getTransactionDescription = (tx: Transaction): string => {
    switch (tx.type) {
      case "buy":
        return `Bought ${tx.amount} ${tx.currency} for ${tx.fiatAmount} ${tx.fiatCurrency}`;
      case "sell":
        return `Sold ${tx.amount} ${tx.currency} for ${tx.fiatAmount} ${tx.fiatCurrency}`;
      case "send":
        return `Sent ${tx.amount} ${tx.currency} to ${tx.recipient.name}`;
      case "receive":
        return `Received ${tx.amount} ${tx.currency} from ${tx.sender.name}`;
      case "swap":
        return `Swapped ${tx.fromAmount} ${tx.fromCurrency} for ${tx.toAmount} ${tx.toCurrency}`;
      default:
        return "Unknown transaction";
    }
  };

  // Filter transactions based on active filter and search query
  const filteredTransactions = transactions.filter((tx: Transaction) => {
    // Filter by type
    if (activeFilter !== "all" && tx.type !== activeFilter) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const description = getTransactionDescription(tx).toLowerCase();

      let counterpartyName = "";
      let counterpartyAddress = "";

      if ("counterparty" in tx && tx.counterparty) {
        counterpartyName = tx.counterparty.name.toLowerCase();
        counterpartyAddress = tx.counterparty.address.toLowerCase();
      } else if ("recipient" in tx && tx.recipient) {
        counterpartyName = tx.recipient.name.toLowerCase();
        counterpartyAddress = tx.recipient.address.toLowerCase();
      } else if ("sender" in tx && tx.sender) {
        counterpartyName = tx.sender.name.toLowerCase();
        counterpartyAddress = tx.sender.address.toLowerCase();
      }

      if (
        description.includes(query) ||
        counterpartyName.includes(query) ||
        counterpartyAddress.includes(query)
      ) {
        return true;
      }
    }

    // Filter by date range
    if (dateRange.from && new Date(dateRange.from) > tx.timestamp) return false;
    if (dateRange.to && new Date(dateRange.to) < tx.timestamp) return false;

    return true;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce<
    Record<string, Transaction[]>
  >((groups, tx) => {
    // Don't group if not mounted yet
    if (!mounted) return {};
    
    const date = tx.timestamp.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(tx);
    return groups;
  }, {});

  // Return early with a loading state if not mounted yet
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <header className="px-4 py-6 border-b border-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text">
                Activity
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-center py-8">
            <p className="text-gray-400">Loading transactions...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Page Header */}
      <header className="px-4 py-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text">
              Activity
            </h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-green-400 transition-all duration-200">
                <Download size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-green-400 transition-all duration-200">
                <Filter
                  size={20}
                  onClick={() => setShowDateFilter(!showDateFilter)}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === "all"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                activeFilter === "buy"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => setActiveFilter("buy")}
            >
              <ArrowDown size={14} className="mr-1" />
              <span>Buy</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                activeFilter === "sell"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => setActiveFilter("sell")}
            >
              <ArrowUp size={14} className="mr-1" />
              <span>Sell</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                activeFilter === "send"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => setActiveFilter("send")}
            >
              <ArrowUp size={14} className="mr-1" />
              <span>Send</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                activeFilter === "receive"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => setActiveFilter("receive")}
            >
              <ArrowDown size={14} className="mr-1" />
              <span>Receive</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                activeFilter === "swap"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => setActiveFilter("swap")}
            >
              <RefreshCw size={14} className="mr-1" />
              <span>Swap</span>
            </button>
          </div>

          {/* Date Filter */}
          {showDateFilter && (
            <div className="p-4 bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                <Calendar size={16} className="mr-2 text-gray-400" />
                Date Range
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, from: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, to: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-6">
          {Object.keys(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions)
              .sort(
                ([dateA], [dateB]) =>
                  new Date(dateB).getTime() - new Date(dateA).getTime(),
              )
              .map(([date, txs]) => (
                <div key={date}>
                  <h2 className="text-sm font-medium text-gray-400 mb-3">
                    {date}
                  </h2>
                  <div className="space-y-3">
                    {txs.map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-4 transition-all duration-200 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-700/60 rounded-full mr-3">
                            {getTransactionIcon(tx.type, tx.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-white">
                                {tx.type === "buy"
                                  ? "Bought"
                                  : tx.type === "sell"
                                    ? "Sold"
                                    : tx.type === "send"
                                      ? "Sent"
                                      : tx.type === "receive"
                                        ? "Received"
                                        : tx.type === "swap"
                                          ? "Swapped"
                                          : "Transaction"}
                              </h3>
                              <div className="flex items-center">
                                {getStatusBadge(tx.status)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                              {getTransactionDescription(tx)}
                            </p>
                            <div className="flex flex-wrap items-center text-xs text-gray-400 gap-x-4 gap-y-1">
                              <span className="flex items-center">
                                <Clock size={12} className="mr-1" />{" "}
                                {formatDate(tx.timestamp)}
                              </span>
                              {"counterparty" in tx && tx.counterparty && (
                                <span className="flex items-center truncate max-w-[200px]">
                                  With: {tx.counterparty.name}
                                </span>
                              )}
                              {"recipient" in tx && tx.recipient && (
                                <span className="flex items-center truncate max-w-[200px]">
                                  To: {tx.recipient.name}
                                </span>
                              )}
                              {"sender" in tx && tx.sender && (
                                <span className="flex items-center truncate max-w-[200px]">
                                  From: {tx.sender.name}
                                </span>
                              )}
                              {tx.txHash && (
                                <span className="flex items-center">
                                  <button className="hover:text-green-400 transition-colors duration-200 flex items-center">
                                    Explorer{" "}
                                    <ExternalLink size={10} className="ml-1" />
                                  </button>
                                </span>
                              )}
                            </div>
                            {tx.status === "failed" && tx.failureReason && (
                              <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-md p-2 text-xs text-red-400 flex items-start">
                                <AlertCircle
                                  size={14}
                                  className="mr-1 flex-shrink-0 mt-0.5"
                                />
                                <span>{tx.failureReason}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-gray-400 hover:text-green-400 transition-all duration-200 ml-2">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
              <RefreshCw size={32} className="mx-auto text-gray-500 mb-2" />
              <h3 className="text-lg font-medium text-white">
                No transactions found
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : activeFilter !== "all"
                    ? `No ${activeFilter} transactions in the selected time period`
                    : "Your transaction history will appear here"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivityPage;
