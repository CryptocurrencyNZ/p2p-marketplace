"use client";

import { AlertCircle, Github, Monitor, Smartphone } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({
    discord: false,
    github: false,
  });

  const handleDiscordLogin = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, discord: true }));
      setAuthError(null);
      await signIn("discord", { redirectTo: "/login/onboarding" });
    } catch (error) {
      setAuthError("Failed to authenticate with Discord. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, discord: false }));
    }
  };

  const handleGithubLogin = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, github: true }));
      setAuthError(null);
      await signIn("github", { redirectTo: "/login/onboarding" });
    } catch (error) {
      setAuthError("Failed to authenticate with GitHub. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, github: false }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4 relative">
      {/* Background elements */}
      <div className="fixed scale-150 inset-0 w-screen h-screen bg-[url('/profile_background.png')] bg-cover bg-center opacity-80"></div>

      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-green-500/20 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-green-500/10 blur-3xl"></div>

      {/* Main card */}
      <div className="w-full max-w-md relative backdrop-blur-sm bg-gray-800/70 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
        {/* Subtle glow border effect */}
        <div className="absolute inset-0 border border-green-500/20 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] pointer-events-none"></div>

        {/* Header */}
        <div className="space-y-1 p-6 pb-4">
          <div className="flex justify-center mb-6">
            <div className="relative">

      <div className="p-4 bg-gray-900 rounded-lg m-2 shadow-md border border-green-500">
        <div className="text-center">
          <div style={{ 
            fontFamily: '"Press Start 2P", "VT323", "Silkscreen", monospace', 
            letterSpacing: '1px',
            WebkitFontSmoothing: 'none', 
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'geometricPrecision',
            imageRendering: 'pixelated' as 'pixelated'
          }}>
            <div className="flex justify-center space-x-1 text-2xl font-bold">
              <span className="text-green-500">NZ</span>
              <span className="text-green-500">P2P</span>
              <span className="text-green-500">DAO</span>
            </div>
            
            <div className="mt-1 text-2xl font-bold">
              <span className="text-green-500">Marketplace</span>
              <span className="text-white ml-1">V.2</span>
            </div>
          </div>
          
          <div className="mt-2 flex justify-center space-x-1 text-4xl">
          ⚔️
          </div>
        </div>
      </div>
              
              {/* Glow effect under logo */}
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-500/0 via-green-500/70 to-green-500/0 blur-sm"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white">
            Welcome back
          </h2>
          <p className="text-center text-gray-400">
            Choose your preferred login method
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 pb-8">
          {authError && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-bold">Error</span>
              </div>
              <p className="mt-1">{authError}</p>
            </div>
          )}

          <div className="grid gap-4">
            <button
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white hover:text-green-300 hover:border-green-500/50 transition-all p-2.5 rounded-md w-full"
              onClick={handleDiscordLogin}
              disabled={isLoading.discord}
            >
              {isLoading.discord ? (
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-green-400 animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 127.14 96.36"
                  className="text-white"
                >
                  <path
                    d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                    fill="#5865F2"
                  />
                </svg>
              )}
              <span>Continue with Discord</span>
            </button>

            <button
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white hover:text-green-300 hover:border-green-500/50 transition-all p-2.5 rounded-md w-full"
              onClick={handleGithubLogin}
              disabled={isLoading.github}
            >
              {isLoading.github ? (
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-green-400 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              <span>Continue with GitHub</span>
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gray-700"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col space-y-2 pt-0 pb-6 px-6 text-gray-400">
          <div className="text-xs text-center">
            By continuing, you agree to our
            <a
              href="/terms"
              className="text-green-400 ml-1 hover:text-green-300 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and
            <a
              href="/privacy"
              className="text-green-400 ml-1 hover:text-green-300 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
          <div className="text-center text-xs flex justify-center items-center gap-1 mt-1">
            <Monitor className="h-3 w-3 text-green-500" />{" "}
            <Smartphone className="h-3 w-3 text-green-500" />
            <span className="bg-gradient-to-r from-green-500 to-green-300 inline-block text-transparent bg-clip-text">
              Optimized for all devices
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
