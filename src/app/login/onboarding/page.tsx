"use client"

import React, { useState, ChangeEvent } from 'react';

// Type definitions
interface Step {
  title: string;
  content: React.ReactNode;
}

interface UserProfile {
  username: string;
  bio: string;
  profileImage: File | null;
}

const OnboardingFlow: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [agreed, setAgreed] = useState<boolean[]>([false, false, false, false, false, false]);
  
  // User profile data state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '',
    bio: '',
    profileImage: null
  });
  const [profileImageURL, setProfileImageURL] = useState<string>('');

  // Handle profile image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setUserProfile({
        ...userProfile,
        profileImage: file
      });
      const imageUrl = URL.createObjectURL(file);
      setProfileImageURL(imageUrl);
    }
  };

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value
    });
  };

  const steps: Step[] = [
    {
      title: "P2P Trading Tips",
      content: (
        <div className="space-y-3">
          <p className="font-medium text-green-300">Your guide to safe peer-to-peer trading:</p>
          <div className="grid gap-3">
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Verify Identity</h4>
                <p className="text-xs text-gray-300">Always verify the real identity of your trading partner before proceeding.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Use Secure Payments</h4>
                <p className="text-xs text-gray-300">Choose payment methods that cannot be easily reversed, like cash or crypto.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Be Skeptical of Screenshots</h4>
                <p className="text-xs text-gray-300">Payment screenshots can be easily fabricated. Verify transactions independently.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Choose Local Traders</h4>
                <p className="text-xs text-gray-300">Use Kiwi-based P2P traders and avoid those claiming to be from NZ but operating overseas.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Meet in Person</h4>
                <p className="text-xs text-gray-300">Conduct trades in public, secure locations like libraries or near police stations.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Known Scams",
      content: (
        <div className="space-y-3">
          <p className="font-medium text-green-300">Be aware of these common crypto scams:</p>
          <div className="grid gap-3">
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Impersonation</h4>
                <p className="text-xs text-gray-300">Scammers pose as trusted entities to gain your trust and steal your assets.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <polyline points="23 20 23 14 17 14"></polyline>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Payment Reversal</h4>
                <p className="text-xs text-gray-300">Transactions get reversed after you've sent the crypto, resulting in total loss.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Phishing</h4>
                <p className="text-xs text-gray-300">Fake websites and emails designed to steal your credentials and access your funds.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Fake Escrow</h4>
                <p className="text-xs text-gray-300">Scammers use sock puppet accounts as "middlemen" to steal your funds.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Buying Guide",
      content: (
        <div className="space-y-3">
          <p className="font-medium text-green-300">How to buy cryptocurrency safely:</p>
          <div className="grid gap-3">
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Find a Seller</h4>
                <p className="text-xs text-gray-300">Locate a seller in your regional channel who has good reputation and reviews.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Create Your Post</h4>
                <p className="text-xs text-gray-300">Specify location, crypto type, volume, and price in NZD in your post.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Verify Reputation</h4>
                <p className="text-xs text-gray-300">Check the reputation system and get vouches from other traders.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Execute Safely</h4>
                <p className="text-xs text-gray-300">Meet in person, start with small amounts, and complete the trade methodically.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Build Reputation</h4>
                <p className="text-xs text-gray-300">Post trade details afterward to build your own reputation in the community.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Selling Guide",
      content: (
        <div className="space-y-3">
          <p className="font-medium text-green-300">How to sell cryptocurrency safely:</p>
          <div className="grid gap-3">
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Choose Your Channel</h4>
                <p className="text-xs text-gray-300">Post in your regional channel once to avoid duplicate listings.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <line x1="17" y1="10" x2="3" y2="10"></line>
                  <line x1="21" y1="6" x2="3" y2="6"></line>
                  <line x1="21" y1="14" x2="3" y2="14"></line>
                  <line x1="17" y1="18" x2="3" y2="18"></line>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Format Your Listing</h4>
                <p className="text-xs text-gray-300">Clearly state crypto type, volume available, and pricing terms.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Screen Buyers</h4>
                <p className="text-xs text-gray-300">Wait for interested buyers and carefully evaluate their inquiries.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path>
                  <path d="M18 9V5l-4-4"></path>
                  <path d="M13 5v4h4"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Due Diligence</h4>
                <p className="text-xs text-gray-300">Perform thorough background checks on potential buyers.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v4l2 2"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Trade Safely</h4>
                <p className="text-xs text-gray-300">Meet in a secure location and complete the transaction methodically.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Platform Risks",
      content: (
        <div className="space-y-3">
          <p className="font-medium text-green-300">Important risk acknowledgments:</p>
          <div className="grid gap-3">
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Volatility</h4>
                <p className="text-xs text-gray-300">Cryptocurrency values can fluctuate dramatically in short periods of time.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Counterparty Risk</h4>
                <p className="text-xs text-gray-300">P2P trading inherently carries risks associated with dealing with unknown parties.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Personal Responsibility</h4>
                <p className="text-xs text-gray-300">You are solely responsible for your trading decisions and securing your assets.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Limited Recourse</h4>
                <p className="text-xs text-gray-300">Cryptocurrency transactions are generally irreversible with no chargebacks.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start gap-3">
              <div className="bg-green-500/20 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M2 22h20"></path>
                  <path d="M21 7v12c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V7l9-5 9 5Z"></path>
                  <path d="M9 21v-7.3c0-1 .7-1.8 1.5-1.8s1.5.8 1.5 1.8V21"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Financial Risk</h4>
                <p className="text-xs text-gray-300">Never invest more than you can afford to lose in cryptocurrency.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Setup Your Profile",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={userProfile.username}
              onChange={handleInputChange}
              placeholder="Choose a unique username"
              className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border border-gray-600">
                {profileImageURL ? (
                  <img src={profileImageURL} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </div>
              <label className="flex items-center px-4 py-2 bg-gray-700 text-gray-200 rounded-md border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                  <line x1="16" y1="8" x2="8" y2="16"></line>
                  <line x1="16" y1="16" x2="8" y2="8"></line>
                </svg>
                Upload Image
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300" htmlFor="bio">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              value={userProfile.bio}
              onChange={handleInputChange}
              placeholder="Tell other users about yourself..."
              rows={3}
              maxLength={200}
              className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            ></textarea>
            <p className="text-xs text-gray-400 mt-1">
              {userProfile.bio.length}/200 characters
            </p>
          </div>
        </div>
      )
    },
  ];

  const handleAgree = (index: number): void => {
    const newAgreed = [...agreed];
    newAgreed[index] = true;
    setAgreed(newAgreed);
    
    // For profile setup step, validate fields
    if (index === 5) { // Profile setup step (index 5)
      if (!userProfile.username.trim()) {
        alert("Please enter a username");
        newAgreed[index] = false;
        setAgreed(newAgreed);
        return;
      }
    }
    
    // Auto-proceed to next step if not the last one
    if (index < steps.length - 1) {
      setTimeout(() => nextStep(), 500);
    }
  };

  const nextStep = (): void => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if current step is profile setup
  const isProfileStep = currentStep === 5;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  // Determine button text based on step
  const getButtonText = (): string => {
    if (isProfileStep) {
      return "Save Profile";
    }
    return "I understand and agree";
  };

  // Complete onboarding and submit profile data
  const completeOnboarding = (): void => {
    // Here you would typically send the data to your API
    console.log("Completed profile:", userProfile);
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/CNZ_logo.png')] bg-cover opacity-10"></div>

      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-green-500/20 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-green-500/10 blur-3xl"></div>
        
      {/* Progress header */}
      <div className="w-full bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 p-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">
            <span className="bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text">
              Onboarding
            </span>
          </h2>
          <div className="w-full bg-gray-700 h-2 rounded-full">
            <div 
              className="bg-gradient-to-r from-green-600 to-green-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Start</span>
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>Complete</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto relative z-10">
          <div className="backdrop-blur-sm bg-gray-800/90 border border-gray-700 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-green-400 mr-2">{currentStep + 1}.</span>
              {steps[currentStep].title}
            </h3>
            
            <div className="mb-6">
              {steps[currentStep].content}
            </div>
            
            {!agreed[currentStep] ? (
              <button 
                onClick={() => handleAgree(currentStep)}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
              >
                {getButtonText()}
              </button>
            ) : (
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center text-green-400 text-sm gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{isProfileStep ? "Profile saved" : "You've agreed to this section"}</span>
                </div>
                
                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button 
                      onClick={prevStep}
                      className="flex-1 bg-gray-800 text-white border border-gray-700 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200"
                    >
                      Previous
                    </button>
                  )}
                  
                  {!isLastStep ? (
                    <button 
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      onClick={completeOnboarding}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    >
                      Complete Onboarding
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step indicators */}
          <div className="mt-6 flex justify-center">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-3 h-3 rounded-full mx-1 ${
                  index === currentStep 
                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                    : index < currentStep 
                      ? 'bg-green-800' 
                      : 'bg-gray-700'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;