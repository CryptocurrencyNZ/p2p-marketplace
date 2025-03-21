"use client"
import { useState, useEffect } from 'react';
import P2PCryptoTradeMap from "@/components/Map/map";
import Background from "@/components/AnimatedBackground";
import { Menu, X } from 'lucide-react';
import Navbar from "@/components/NavBar";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
  <Background />
    
    
      {/* Main content - positioned to the right of navbar on desktop */}
      <div className={`${isMobile ? '-mt-8' : ''}`}>
        <div className={`${!isMobile ? 'ml-64' : ''} flex justify-center items-center min-h-screen`}>
          <div className="w-full max-w-6xl px-4 md:px-8">
            <div className="w-full h-96 md:h-[75vh] mb-8">
              <P2PCryptoTradeMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}