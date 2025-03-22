"use client";

// app/profile/page.tsx
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
  ShieldCheck,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { auth } from "@/auth";
import { convertRepToStar } from "@/lib/rep_system/repConversions";
import { fetchUserElo } from '@/lib/rep_system/updateRep';
import { profileEnd } from "console";

// Define types for our profile data
interface Listing {
  id: string;
  title: string;
  price: string;
  category: string;
  listed: string;
  views: number;
  featured: boolean;
}

// Define type for API listing response
interface ApiListing {
  id: number;
  userId: string;
  username: string;
  createdAt: string;
  title: string;
  location: string;
  price: string;
  isBuy: boolean;
  currency: string;
  description: string;
  onChainProof: boolean;
  marginRate: string;
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
  rep: number;
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
  totalTrades: 0,
  reputation: 0,
  volumeTraded: "0 ETH",
  profileImage: "/api/placeholder/120/120",
  isVerified: false,
  joinedDate: "March 2023",
  bio: "",
  currentListings: [],
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async (): Promise<void> => {
      try {
        const response = await fetch("/api/profile");

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const profile: ProfileApiResponse = await response.json();

        setUserData({
          ...initialUserData,
          username: profile.username || "Anonymous User",
          bio: profile.bio || "No bio provided",
          profileImage: profile.avatar || "/pfp-placeholder.jpg",
          age: profile.age || 0,
          reputation: profile.rep
        });

        console.log(profile.rep);

        setEditedProfile({
          username: profile.username || "",
          age: userData.age,
          bio: profile.bio || "",
          avatar: profile.avatar || "",
        });
        
        // Fetch user listings after profile is loaded
        fetchUserListings();
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userData.age]);
  
  // Fetch user listings
  const fetchUserListings = async (): Promise<void> => {
    try {
      const response = await fetch("/api/listings/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch listings data");
      }
      
      const listings: ApiListing[] = await response.json();
      
      // Transform API listings to the format expected by the UI
      const formattedListings: Listing[] = listings.map((listing) => ({
        id: String(listing.id),
        title: listing.title,
        price: `${listing.price} ${listing.currency}`,
        category: listing.isBuy ? "Buy" : "Sell",
        listed: formatDate(listing.createdAt),
        views: 0, // Default value as views aren't provided by the API
        featured: listing.onChainProof // Using onChainProof as featured flag
      }));
      
      setUserData(prevData => ({
        ...prevData,
        currentListings: formattedListings
      }));
      
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

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

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setUserData({
        ...userData,
        username: editedProfile.username,
        bio: editedProfile.bio,
        age: editedProfile.age,
        profileImage: editedProfile.avatar || userData.profileImage,
      });

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const base64String = event.target?.result as string;
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
                <div
                  className="bg-blue-500/20 p-1 rounded-full"
                  title="KYC Verified"
                >
                  <ShieldCheck size={14} className="text-blue-400" />
                </div>
              </div>

              <div className="text-gray-400 text-sm">
                Age: {userData.age} • Joined {userData.joinedDate}
              </div>

              <p className="mt-2 text-sm text-gray-300 max-w-[320px] break-words overflow-hidden">
  {userData.bio}
</p>

              <div className="mt-4 grid grid-cols-3 gap-4 select-none scale-150 pl-32">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Reputation ({userData.reputation}★)</p>
                  <div className="flex items-center gap-10">

                    <div className="flex">
                      {(() => {
                        const rating = Math.min(
                          Math.max(userData.reputation, 0),
                          5
                        );
                        const fullStars = Math.floor(rating);
                        const decimal = rating % 1;
                        const stars = [];

                        for (let i = 0; i < fullStars; i++) {
                          stars.push(
                            <Star
                              key={i}
                              size={20}
                              className="text-green-400"
                              fill="#22c55e

"
                            />
                          );
                        }

                        if (decimal > 0 && stars.length < 5) {
                          stars.push(
                            <div
                              key="partial"
                              className="relative inline-block"
                            >
                              <Star
                                size={20}
                                className="text-green-400"
                              />
                              <div
                                className="absolute top-0 left-0 overflow-hidden"
                                style={{ width: `${decimal * 100}%` }}
                              >
                                <Star
                                  size={20}
                                  className="text-green-400"
                                  fill="#22c55e"
                                />
                              </div>
                            </div>
                          );
                        }

                        while (stars.length < 5) {
                          stars.push(
                            <Star
                              key={stars.length}
                              size={20}
                              className="text-gray-400"
                            />
                          );
                        }

                        return stars;
                      })()}
                    </div>
                  </div>
                </div>
                {/* Keep other stat boxes */}
                
              </div>

              <div className="mt-10 flex gap-3 items-center justify-center md:justify-start">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium text-sm px-4 py-2 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300"
                >
                  Edit Profile
                </button>
                <button className="bg-gray-800 text-white text-sm border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all">
                  Share Profile
                </button>
                <a href="https://www.instagram.com/cryptocurrency_nz/">
                  <button className="bg-gray-800 text-white text-sm border border-gray-700 px-1.5 py-1.5 rounded-lg hover:bg-gray-700 transition-all">
                    <Instagram size={25} className="text-white-400" />
                  </button>
                </a>
                <a href="https://x.com/Aoraki_RangerNZ">
                  <button className="bg-gray-800 text-white text-sm border border-gray-700 px-1.5 py-1.5 rounded-lg hover:bg-gray-700 hover:scale-105 transition-all transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 50 50"
                      width="25"
                      height="23"
                      className="text-white-400 fill-current"
                    >
                      <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
                    </svg>
                  </button>
                </a>
                <a href="https://www.facebook.com/AorakiRanger">
                  <button className="bg-gray-800 text-white text-sm border border-gray-700 px-1.5 py-1.5 rounded-lg hover:bg-gray-700 transition-all">
                    <Facebook size={25} className="text-white-400" />
                  </button>
                </a>
                <a href="https://www.linkedin.com/in/harry-satoshi/">
                  <button className="bg-gray-800 text-white text-sm border border-gray-700 px-1.5 py-1.5 rounded-lg hover:bg-gray-700 transition-all">
                    <Linkedin size={25} className="text-white-400" />
                  </button>
                </a>
                <a href = "https://steamcommunity.com/id/Satoshi">
                <button className="bg-gray-800 text-white text-sm border border-gray-700 px-1 py-1 rounded-lg hover:bg-gray-700 transition-all">
                
                  <svg fill="#ffffff" width="29px" height="29px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>Steam icon</title><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/></svg>

                </button>
                </a>
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
              {userData.currentListings && userData.currentListings.length > 0 ? (
                userData.currentListings.map((listing) => (
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
                    You don&apos;t have any items listed for sale. Create a new
                    listing to get started.
                  </p>
                  <Link
                    href="create"
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
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
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
                  <label
                    htmlFor="age"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
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
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
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