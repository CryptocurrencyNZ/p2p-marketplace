// app/dashboard/listing/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Wallet,
  MapPin,
  Clock,
  Star,
  MessageCircle,
  AlertCircle,
  Share2,
  Tag,
  BarChart3,
  Shield,
  Loader2,
} from "lucide-react";

// Enhanced interface with seller data
interface Listing {
  id: string;
  title: string;
  price: string;
  currency: string;
  description?: string;
  isBuy: boolean;
  location?: string;
  marginRate?: string;
  onChainProof?: boolean;
  createdAt: string;
  userId?: string;
  username?: string;
  isComplete?: boolean;
  sellerReputation?: number;
  sellerTrades?: number;
  sellerJoinDate?: string;
  sellerResponseTime?: string;
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // The listingId from params for the dependency array
  const listingId = params?.id;

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/listings/${listingId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch listing: ${response.status}`);
        }
        
        const data = await response.json();
        setListing(data);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Unable to load listing details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-green-400 mr-2" size={24} />
        <span>Loading listing details...</span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="text-red-400 mb-4" size={48} />
        <h1 className="text-xl font-semibold mb-2">Error Loading Listing</h1>
        <p className="text-gray-400 mb-6 text-center">{error || "Listing not found"}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 flex items-center hover:bg-gray-700 transition-all"
        >
          <ChevronLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Format date for display
  const formattedDate = new Date(listing.createdAt).toLocaleDateString("en-NZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header with back button */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back
          </button>
          
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all">
              <Share2 size={18} />
            </button>
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all">
              <Star size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Listing header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {listing.isBuy ? (
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium">
                Buy
              </span>
            ) : (
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                Sell
              </span>
            )}
            {listing.onChainProof && (
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full font-medium">
                Verified
              </span>
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{formattedDate}</span>
            </div>
            
            {listing.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                <span>{listing.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5">
              <Wallet size={16} />
              <span>{listing.price} {listing.currency}</span>
            </div>
            
            {listing.marginRate && (
              <div className="flex items-center gap-1.5">
                <BarChart3 size={16} />
                <span>{listing.marginRate}% margin</span>
              </div>
            )}
          </div>
        </div>

        {/* Description card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-gray-300 whitespace-pre-line">
            {listing.description || "No description provided."}
          </p>
        </div>

        {/* User card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">About the seller</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden">
                <Image 
                  src="/api/placeholder/56/56" 
                  alt={listing.username || "User"} 
                  width={56} 
                  height={56} 
                  className="object-cover"
                />
              </div>
              {/* Trusted badge */}
              <div className="absolute -bottom-1 -right-1 bg-green-500/20 p-1 rounded-full border border-gray-700">
                <Shield size={12} className="text-green-400" />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium">{listing.username || "Anonymous User"}</h3>
              <p className="text-gray-400 text-sm">Member since {listing.sellerJoinDate || "Jan 2023"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">Reputation</p>
              <p className="font-semibold text-green-400">{listing.sellerReputation || 100}%</p>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">Trades</p>
              <p className="font-semibold text-white">{listing.sellerTrades || 0}</p>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">Response</p>
              <p className="font-semibold text-white">{listing.sellerResponseTime || "~2h"}</p>
            </div>
          </div>
        </div>

        {/* Safety tips */}
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-400 mb-1">Safety tips</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Always verify the trader's identity before proceeding</li>
                <li>• Never use payment methods that can be reversed</li>
                <li>• Meet in a public place for cash transactions</li>
                <li>• Start with a small amount if this is a new trader</li>
              </ul>
              <Link 
                href="/safety" 
                className="text-xs text-green-400 mt-2 inline-flex items-center hover:text-green-300"
              >
                View all safety tips
              </Link>
            </div>
          </div>
        </div>

        {/* Action button */}
    <div className="flex">
      <button className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium text-sm px-4 py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300 flex items-center justify-center">
        <MessageCircle size={18} className="mr-2" />
        Message Seller
      </button>
    </div>
      </div>
    </div>
  );
}