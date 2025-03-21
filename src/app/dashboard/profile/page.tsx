"use client";

// app/profile/page.tsx
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ArrowRight,
  Edit,
  ChevronRight,
  BarChart3,
  Wallet,
  Tag,
  X,
  Camera,
  Save,
} from "lucide-react";

// Mock user data - in a real app this would come from your API
const userData = {
  username: "Crypto_Trader99",
  age: 27,
  reputation: 156,
  totalTrades: 38,
  volumeTraded: "12.45 ETH",
  profileImage: "/api/placeholder/120/120", // Replace with actual image
  isVerified: true,
  joinedDate: "March 2023",
  bio: "Crypto enthusiast and NFT collector since 2021. Looking for rare digital assets and exclusive collections.",
  currentListings: [
    {
      id: "1",
      title: "Premium NFT Collection",
      price: "2.5 ETH",
      category: "Digital Art",
      listed: "2 days ago",
      views: 42,
      featured: true,
    },
    {
      id: "2",
      title: "Gaming Assets Bundle",
      price: "0.75 ETH",
      category: "Gaming",
      listed: "1 week ago",
      views: 28,
      featured: false,
    },
    {
      id: "3",
      title: "Rare Collectible Item",
      price: "1.2 ETH",
      category: "Collectibles",
      listed: "3 days ago",
      views: 19,
      featured: false,
    },
  ],
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("listings");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    username: userData.username,
    age: userData.age,
    bio: "Crypto enthusiast and NFT collector since 2021. Looking for rare digital assets and exclusive collections.", // Added bio field
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Profile Header Section */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 pt-6 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Basic Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-700 relative">
                <Image
                  src={userData.profileImage}
                  alt={userData.username}
                  width={120}
                  height={120}
                  className="object-cover"
                />
                <div className="absolute inset-0 rounded-full border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"></div>
              </div>
              <div className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-1.5 border border-gray-700 shadow-lg">
                <Edit size={14} className="text-green-400" />
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold">{userData.username}</h1>
                {userData.isVerified && (
                  <div className="bg-green-500/20 p-1 rounded-full">
                    <Star size={14} className="text-green-400" fill="#22c55e" />
                  </div>
                )}
              </div>

              <div className="text-gray-400 text-sm">
                Age: {userData.age} • Joined {userData.joinedDate}
              </div>

              {/* Bio */}
              <p className="mt-2 text-sm text-gray-300 max-w-md">
                {userData.bio}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-800/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">Reputation</p>
                  <p className="font-semibold text-green-400">
                    {userData.reputation}
                  </p>
                </div>
                <div className="bg-gray-800/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">Trades</p>
                  <p className="font-semibold text-white">
                    {userData.totalTrades}
                  </p>
                </div>
                <div className="bg-gray-800/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">Volume</p>
                  <p className="font-semibold text-white">
                    {userData.volumeTraded}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3 items-center justify-center md:justify-start">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium text-sm px-4 py-2 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300"
                >
                  Edit Profile
                </button>
                <button className="bg-gray-800 text-white text-sm border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all">
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("listings")}
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === "listings"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Current Listings
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === "history"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Trade History
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === "stats"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Stats & Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-4">
        {activeTab === "listings" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Listings</h2>
              <Link
                href="/create"
                className="text-green-400 text-sm flex items-center hover:text-green-300"
              >
                <span>Create New</span>
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            {/* Listings */}
            <div className="space-y-3">
              {userData.currentListings.map((listing) => (
                <Link href={`/listing/${listing.id}`} key={listing.id}>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-2 hover:bg-gray-800 transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{listing.title}</h3>
                          {listing.featured && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-gray-400 text-sm">
                          <div className="flex items-center gap-1">
                            <Tag size={14} />
                            <span>{listing.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Wallet size={14} />
                            <span>{listing.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-2">
                          <div className="text-gray-400 text-xs">
                            {listing.listed}
                          </div>
                          <div className="flex items-center text-gray-400 text-xs mt-1">
                            <BarChart3 size={12} className="mr-1" />
                            <span>{listing.views} views</span>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-600" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {userData.currentListings.length === 0 && (
              <div className="text-center py-10">
                <div className="bg-gray-800/50 inline-flex rounded-full p-3 mb-4">
                  <Tag size={24} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-300">
                  No active listings
                </h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                  You don't have any items listed for sale. Create a new listing
                  to get started.
                </p>
                <Link
                  href="/create"
                  className="mt-4 inline-flex bg-green-600 text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-green-500 transition-all"
                >
                  Create Listing
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="flex items-center justify-center h-40 text-gray-500">
            Trade history will be displayed here
          </div>
        )}

        {activeTab === "stats" && (
          <div className="flex items-center justify-center h-40 text-gray-500">
            User statistics and analytics will be displayed here
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-700 relative">
                    <Image
                      src={userData.profileImage}
                      alt={userData.username}
                      width={120}
                      height={120}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 rounded-full border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"></div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border border-gray-800 shadow-lg hover:bg-green-400 transition-colors"
                  >
                    <Camera size={14} className="text-gray-900" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        // Handle file upload in a real app
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  Click the camera icon to change your profile photo
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editedProfile.username}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={editedProfile.age}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        age: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        bio: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Brief description about yourself (max 200 characters)
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 p-4 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In a real app, you would save changes to the backend here
                  setIsEditModalOpen(false);
                  // Show a success message or toast notification
                }}
                className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-md shadow-sm hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] flex items-center gap-1.5 transition-all"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
