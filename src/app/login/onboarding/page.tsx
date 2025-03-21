"use client"

import React, { useState } from 'react';

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agreed, setAgreed] = useState([false, false, false, false, false]);

  const steps = [
    {
      title: "P2P Trading Tips",
      content: (
        <div className="space-y-2">
          <p className="font-medium">Your guide to safe peer-to-peer trading:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Always verify the real identity of your trader</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Use secure payment methods that cannot be reversed</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Be aware that payment screenshots can be easily fabricated</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Use Kiwi-based P2P traders, avoid overseas "NZ" traders</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Meet your trader in person at a secure, public location</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Trust your intuition if something feels suspicious</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Consider test trades of smaller amounts first</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Always speak with traders via voice call before meeting</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Known Scams",
      content: (
        <div className="space-y-2">
          <p className="font-medium">Be aware of these common crypto scams:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span><span className="text-green-400 font-medium">Impersonation:</span> Scammers pose as trusted entities to gain your trust</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span><span className="text-green-400 font-medium">Payment reversal:</span> Transactions get reversed after you've sent crypto</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span><span className="text-green-400 font-medium">Phishing:</span> Fake websites or emails designed to steal credentials</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span><span className="text-green-400 font-medium">Fake escrow:</span> Scammers use sock puppet accounts as "middlemen"</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span><span className="text-green-400 font-medium">Fake wallets:</span> Backdoored wallets that can be emptied remotely</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span><span className="text-green-400 font-medium">Social engineering:</span> Manipulative tactics to establish false trust</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Buying Guide",
      content: (
        <div className="space-y-2">
          <p className="font-medium">How to buy cryptocurrency safely:</p>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li className="pl-1">Locate a seller in your regional channel</li>
            <li className="pl-1">Create a post with your requirements:
              <ul className="ml-5 mt-1 space-y-1">
                <li>- Location</li>
                <li>- Crypto type</li>
                <li>- Volume</li>
                <li>- Price in NZD</li>
              </ul>
            </li>
            <li className="pl-1">Await offers and check the reputation system</li>
            <li className="pl-1">Perform background and KYC checks:
              <ul className="ml-5 mt-1 space-y-1">
                <li>- Verify seller reputation</li>
                <li>- Consider meeting in person</li>
                <li>- Start with small amounts</li>
                <li>- Get vouches from others</li>
              </ul>
            </li>
            <li className="pl-1">Complete the trade</li>
            <li className="pl-1">Post trade details to build your reputation</li>
          </ol>
        </div>
      )
    },
    {
      title: "Selling Guide",
      content: (
        <div className="space-y-2">
          <p className="font-medium">How to sell cryptocurrency safely:</p>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li className="pl-1">Post in your regional channel (avoid duplicates)</li>
            <li className="pl-1">Format your listing clearly:
              <ul className="ml-5 mt-1 space-y-1">
                <li>- Crypto type</li>
                <li>- Volume available</li>
                <li>- Price (spot, +%, or NZD value)</li>
              </ul>
            </li>
            <li className="pl-1">Wait for interested buyers to contact you</li>
            <li className="pl-1">Perform due diligence on potential buyers</li>
            <li className="pl-1">Complete the trade safely</li>
            <li className="pl-1">Post trade details to increase your reputation</li>
          </ol>
        </div>
      )
    },
    {
      title: "Platform Risks",
      content: (
        <div className="space-y-2">
          <p className="font-medium">Important risk acknowledgments:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Cryptocurrency values can be highly volatile</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>P2P trading carries inherent counterparty risks</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>You are responsible for your own trading decisions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>The platform provides tools but cannot guarantee safety</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>You should never invest more than you can afford to lose</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>Cryptocurrency transactions are generally irreversible</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">•</span>
              <span>You are responsible for securing your own crypto assets</span>
            </li>
          </ul>
        </div>
      )
    }
  ];

  const handleAgree = (index: number) => {
    const newAgreed = [...agreed];
    newAgreed[index] = true;
    setAgreed(newAgreed);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Progress header */}
      <div className="w-full bg-gray-800 border-b border-gray-700 p-4">
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
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] p-6">
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
                I understand and agree
              </button>
            ) : (
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center text-green-400 text-sm gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>You've agreed to this section</span>
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
                      onClick={() => window.location.href = '/dashboard'}
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