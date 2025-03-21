"use client"
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import Navbar from "@/components/NavBar";
import P2PCryptoTradeMap from "@/components/Map/map";
import Background from "@/components/AnimatedBackground";
import { Menu, X } from 'lucide-react';
import Protected from "@/lib/auth/protected";

const inter = Inter({ subsets: ["latin"] });

const metadata: Metadata = {
  title: 'Crypto P2P Marketplace',
  description: 'Find P2P crypto trading opportunities in New Zealand',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Check if we're on mobile - client side only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Close menu if switching to desktop
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <html lang="en">
      <Protected>
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen overflow-x-hidden`}>
        <Background />
        
        {/* Mobile menu toggle button */}
        {isMobile && (
          <button 
            className="fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-md text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
        
        <div className="flex flex-col md:flex-row h-screen">
          {/* Side navbar - hidden on mobile by default */}
          <aside 
            className={`
              ${isMobile ? 
                `fixed top-0 left-0 z-40 w-64 h-full transition-transform duration-300 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'}` : 
                'w-64 h-full'
              } bg-gray-800 overflow-y-auto
            `}
          >
            <div className="pt-16 md:pt-0">
              <Navbar />
            </div>
          </aside>
          
          {/* Main content area - full width on mobile */}
          <main 
            className={`
              flex-1 overflow-auto
              ${isMobile && menuOpen ? 'filter blur-sm' : ''}
            `}
            onClick={() => isMobile && menuOpen && setMenuOpen(false)}
          >
            {/* Title section */}
            <div className="w-full flex flex-col items-center text-center px-8 md:px-[5%] pt-8 lg:pt-[60px] relative z-10 bg-transparent">
              <motion.h1 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, amount: 0.1 }} 
                variants={fadeIn} 
                className="alegreya text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-5 font-bold leading-tight"
              >
                <span className="alegreya text-gray-300">Cryptocurrency</span>
                <motion.span 
                  initial={{ opacity: 0, x: -10 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: 0.8, duration: 0.5 }} 
                  className="alegreya text-green-500"
                >
                  NZ
                </motion.span>
                <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-xl sm:text-2xl md:text-3xl text-gray-400 mb-8"
              >
                P2P Marketplace
              </motion.h2>
              </motion.h1>
            </div>
            
            {/* Map and content section - full width */}
            <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="w-full mb-8"
              >
                <P2PCryptoTradeMap />
              </motion.div>
              
              {children}
            </div>
          </main>
        </div>
        
        {/* Overlay to close menu when clicked outside */}
        {isMobile && menuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </body>
      </Protected>
    </html>
  );
}
