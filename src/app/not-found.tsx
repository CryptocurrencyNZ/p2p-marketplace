"use client"

import React from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw, Search } from 'lucide-react';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Animated Error Icon */}
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle size={60} className="text-green-400" />
            </div>
          </div>
          
          {/* Error Content */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text mb-2">
            404
          </h1>
          <h2 className="text-xl font-semibold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-4 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} CNZ. All rights reserved.
        </p>
      </footer>
    </div>
  );
}