// app/profile/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

// Define types for our profile data
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
}

interface UserProfile {
  username: string;
  age: number;
  reputation: number;
  totalTrades: number;
  volumeTraded: string;
  profileImage: string;
  isVerified: boolean;
  joinedDate: string;
  bio: string;
  currentListings: Listing[];
}

// Define type for API response
interface ProfileApiResponse {
  id?: number;
  auth_id?: string;
  username: string;
  bio?: string | null;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
  age?: number | null;
}

// Define type for profile update payload
interface ProfileUpdatePayload {
  username: string;
  bio?: string;
  avatar?: string;
  age?: number;
}

// Define type for edited profile state
interface EditedProfile {
  username: string;
  age: number;
  bio: string;
  avatar: string;
}

// Initial placeholder data (will be replaced with API data)
const initialUserData: UserProfile = {
  username: "",
  age: 0,
  reputation: 0,
  totalTrades: 0,
  volumeTraded: "0 ETH",
  profileImage: "/api/placeholder/120/120",
  isVerified: false,
  joinedDate: "March 2023",
  bio: "",
  currentListings: []
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserProfile>(initialUserData);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("listings");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editedProfile, setEditedProfile] = useState<EditedProfile>({
    username: "",
    age: 0,
    bio: "",
    avatar: "",
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async (): Promise<void> => {
      try {
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const profile: ProfileApiResponse = await response.json();
        
        // Update the userData state with fetched profile
        setUserData({
          ...initialUserData,
          username: profile.username || 'Anonymous User',
          bio: profile.bio || 'No bio provided',
          profileImage: profile.avatar || '/pfp-placeholder.jpg',
          age: profile.age || 0,
          // Keep other default fields from initialUserData
        });
        
        // Also update the edited profile state
        setEditedProfile({
          username: profile.username || '',
          age: profile.age || 0, // Use profile.age directly instead of userData.age
          bio: profile.bio || '',
          avatar: profile.avatar || '',
        });
        
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []); // Empty dependency array is fine here since we only want to fetch on mount
  
  // Fetch user listings
  useEffect(() => {
    const fetchUserListings = async (): Promise<void> => {
      // Fetch listings when component mounts or tab changes
      setListingsLoading(true);
      try {
        const response = await fetch('/api/listings/profile');

        console.log(response);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user listings');
        }
        
        const listings = await response.json();
        setAllListings(listings);
      } catch (error) {
        console.error('Error fetching user listings:', error);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchUserListings();
  }, []);

  // Handle profile update
  const handleSaveProfile = async (): Promise<void> => {
    setIsSaving(true);
    setSaveError("");
    
    try {
      const payload: ProfileUpdatePayload = {
        username: editedProfile.username,
        bio: editedProfile.bio,
        avatar: editedProfile.avatar,
        age: editedProfile.age,
      };
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      // Update local state with new profile data
      setUserData({
        ...userData,
        username: editedProfile.username,
        bio: editedProfile.bio,
        age: editedProfile.age,
        profileImage: editedProfile.avatar || userData.profileImage,
      });
      
      // Close the modal
      setIsEditModalOpen(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real application, you would upload this to a storage service
    // For now, we'll create a base64 representation
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const base64String = event.target?.result as string;
      // Update the editedProfile state with the new avatar
      setEditedProfile({
        ...editedProfile,
        avatar: base64String,
      });
    };
    reader.readAsDataURL(file);
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-green-400 mr-2" size={24} />
        <span>Loading profile...</span>
      </div>
    );
  }

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

              <p className="mt-2 text-sm text-gray-300 max-w-md break-words overflow-hidden">
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
                href="/dashboard/create"
                className="text-green-400 text-sm flex items-center hover:text-green-300"
              >
                <span>Create New</span>
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            {/* Listings */}
            <div className="space-y-3">
              {listingsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-green-400 mr-2" size={24} />
                  <span>Loading listings...</span>
                </div>
              ) : allListings && allListings.filter(listing => !listing.isComplete).length > 0 ? (
                allListings
                  .filter(listing => !listing.isComplete)
                  .map((listing) => (
                    <Link href={`/dashboard/listing/${listing.id}`} key={listing.id}>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-2 hover:bg-gray-800 transition-all duration-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{listing.title}</h3>
                              {listing.isBuy ? (
                                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                                  Buy
                                </span>
                              ) : (
                                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                                  Sell
                                </span>
                              )}
                              {listing.onChainProof && (
                                <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-gray-400 text-sm">
                              {listing.location && (
                                <div className="flex items-center gap-1">
                                  <Tag size={14} />
                                  <span>{listing.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Wallet size={14} />
                                <span>{listing.price} {listing.currency}</span>
                              </div>
                              {listing.marginRate && (
                                <div className="flex items-center gap-1">
                                  <BarChart3 size={14} />
                                  <span>{listing.marginRate}% margin</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-right mr-2">
                              <div className="text-gray-400 text-xs">
                                {new Date(listing.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-600" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
              ) : (
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
                    href="/dashboard/create"
                    className="mt-4 inline-flex bg-green-600 text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-green-500 transition-all"
                  >
                    Create Listing
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Trade History</h2>
            </div>
            
            {listingsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-green-400 mr-2" size={24} />
                <span>Loading trade history...</span>
              </div>
            ) : allListings && allListings.filter(listing => listing.isComplete).length > 0 ? (
              <div className="space-y-3">
                {allListings
                  .filter(listing => listing.isComplete)
                  .map((trade) => (
                    <div key={trade.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-all duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{trade.title}</h3>
                            {trade.isBuy ? (
                              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                                Bought
                              </span>
                            ) : (
                              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                                Sold
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-gray-400 text-sm">
                            <div className="flex items-center gap-1">
                              <Wallet size={14} />
                              <span>{trade.price} {trade.currency}</span>
                            </div>
                            {trade.username && trade.username !== userData.username && (
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-xs">
                                  {trade.username.charAt(0).toUpperCase()}
                                </div>
                                <span>{trade.username}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs">
                            {new Date(trade.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-gray-800/50 inline-flex rounded-full p-3 mb-4">
                  <BarChart3 size={24} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-300">
                  No trade history
                </h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                  You haven't completed any trades yet. Active listings will appear in your trade history once they are completed.
                </p>
              </div>
            )}
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
                      src={editedProfile.avatar || userData.profileImage}
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
                    type="button"
                  >
                    <Camera size={14} className="text-gray-900" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  Click the camera icon to change your profile photo
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={editedProfile.username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedProfile({
                        ...editedProfile,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-400 mb-1">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={editedProfile.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedProfile({
                        ...editedProfile,
                        age: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={editedProfile.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
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

                {saveError && (
                  <div className="bg-red-900/40 border border-red-800 text-red-300 px-3 py-2 rounded text-sm">
                    {saveError}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-700 p-4 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                disabled={isSaving}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-md shadow-sm hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] flex items-center gap-1.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                type="button"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}