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
  age: number;
  // Add base64 string for image data
  avatarBase64: string;
}

interface ProfileUpdatePayload {
  username: string;
  bio?: string;
  avatar?: string;
  age?: number;
}

interface ProfileUpdateResponse {
  id: string;
  auth_id: string;
  username: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

const OnboardingFlow: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [agreed, setAgreed] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // User profile data state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '',
    bio: '',
    profileImage: null,
    age: 0,
    avatarBase64: '' // Initialize empty base64 string
  });
  const [profileImageURL, setProfileImageURL] = useState<string>('');

  // Handle profile image selection with base64 conversion
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Create URL for preview
      const imageUrl = URL.createObjectURL(file);
      setProfileImageURL(imageUrl);

      // Convert to base64 for API
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setUserProfile({
          ...userProfile,
          profileImage: file,
          avatarBase64: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    
    // For number inputs, convert string to number
    if (type === 'number') {
      setUserProfile({
        ...userProfile,
        [name]: value === '' ? 0 : Number(value)
      });
    } else {
      setUserProfile({
        ...userProfile,
        [name]: value
      });
    }
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
              <label className="block text-sm font-medium text-gray-300" htmlFor="age">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min={16}
                max={120}
                value={userProfile.age || ''}
                onChange={handleInputChange}
                placeholder="Enter your age"
                className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
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
  const completeOnboarding = async (): Promise<void> => {
    // Show loading state
    setIsSubmitting(true);
    setError(null);
  
    try {
      // Prepare the payload for the API using the base64 image data
      const payload: ProfileUpdatePayload = {
        username: userProfile.username,
        bio: userProfile.bio || undefined,
        age: userProfile.age || undefined,
      };
  
      // Only add avatar if we have a base64 image
      if (userProfile.avatarBase64) {
        payload.avatar = userProfile.avatarBase64;
      }
  
      // Make the API request using fetch
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
  
      const data: ProfileUpdateResponse = await response.json();
      console.log('Profile updated successfully:', data);
  
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        console.error('API Error:', error.message);
      } else {
        setError('An unexpected error occurred');
        console.error('Unexpected error:', error);
      }
  
      // Stay on the current page so the user can fix any issues
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white relative">
      {/* Background elements */}
      <div className="fixed w-screen inset-0 bg-[url('/profile_background.png')] bg-cover opacity-80 scale-150 overflow-hidden"></div>

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
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded text-red-300 text-sm">
                {error}
              </div>
            )}
            
            {!agreed[currentStep] ? (
              <button 
                onClick={() => handleAgree(currentStep)}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  getButtonText()
                )}
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
                      disabled={isSubmitting}
                    >
                      Previous
                    </button>
                  )}
                  
                  {!isLastStep ? (
                    <button 
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      disabled={isSubmitting}
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      onClick={completeOnboarding}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium py-3 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Complete Onboarding"
                      )}
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