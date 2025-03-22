"use client";
import {useState} from 'react'
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MapPin, MessageCircle, Plus, Bell, User, LogOut, ChevronDown, ChevronUp, Bookmark, Shield, AlertTriangle } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  
  const openPopup = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  // Mobile navbar (Instagram-like)
  const mobileNavbar = (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-gray-900 border-t border-gray-800 flex items-center justify-around z-50 md:hidden">
      <NavItem
        href="/dashboard"
        icon={<MapPin size={20} />}
        active={isActive("/dashboard")}
        label="P2P Listings"
      />
      <NavItem
        href="/dashboard/messages"
        icon={<MessageCircle size={20} />}
        active={isActive("/dashboard/messages")}
        label="Messages"
      />
      {/* Create listing button (centered, highlighted) */}
      <NavItem
        href="/dashboard/create"
        icon={
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-1.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]">
            <Plus size={18} className="text-gray-900" />
          </div>
        }
        active={isActive("/dashboard/create")}
        label="Create"
      />

      <NavItem
        href="/dashboard/activity"
        icon={<Bell size={20} />}
        active={isActive("/dashboard/activity")}
        label="Activity"
      />
      <NavItem
        href="/dashboard/profile"
        icon={<User size={20} />}
        active={isActive("/dashboard/profile")}
        label="Profile"
      />
      {/* External link to scam guide */}
      <a
        href="#"
        onClick={openPopup}
        className="flex items-center justify-center"
      >
        <div className="text-gray-400 hover:text-green-400">
          <span className="text-sm">📜</span>
        </div>
      </a>
    </div>
  );
  
  // Desktop sidebar
  const desktopSidebar = (
    <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 xl:w-64 bg-gray-900 border-r border-gray-800 flex-col z-50">

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

      {/* Nav items */}
      <div className="flex flex-col flex-1 pt-6 space-y-2">
        <NavItem
          href="/dashboard"
          icon={<MapPin size={24} />}
          active={isActive("/dashboard")}
          label="P2P Listings"
          sidebar
        />
        <NavItem
          href="/dashboard/messages"
          icon={<MessageCircle size={24} />}
          active={isActive("/dashboard/messages")}
          label="Messages"
          sidebar
        />
        <NavItem
          href="/dashboard/create"
          icon={<Plus size={24} />}
          active={isActive("/dashboard/create")}
          label="Create Listing"
          sidebar
        />
        <NavItem
          href="/dashboard/activity"
          icon={<Bell size={24} />}
          active={isActive("/dashboard/activity")}
          label="Activity"
          sidebar
        />
        <NavItem
          href="/dashboard/profile"
          icon={<User size={24} />}
          active={isActive("/dashboard/profile")}
          label="Profile"
          sidebar
        />

        <div className="hidden lg:flex items-center justify-center my-8 w-3/4 m-8">
          <button
            onClick={openPopup}
            className="bg-gradient-to-r from-green-600 to-green-500 w-auto rounded-lg px-6 py-3 flex items-center justify-center gap-3 border border-green-400 text-white font-medium shadow-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
            style={{
              boxShadow: "0 0 12px rgba(74, 222, 128, 0.5), 0 0 20px rgba(74, 222, 128, 0.2)",
            }}
          >
            <span className="text-xl">📜</span>
            <span>View the P2P No-Scam Bible</span>
          </button>
        </div>
      </div>

      {/* Additional options at bottom */}
      <div className="border-t border-gray-800 py-4 px-3 xl:px-6">
        <button
          onClick={() => signOut({ redirectTo: "/" })}
          className={`
          flex items-center xl:px-3 py-3 rounded-lg
          ${
            isActive("/settings")
              ? "bg-gray-800/80 text-green-400"
              : "text-gray-400 hover:text-green-400 hover:bg-gray-800/50"
          }
          transition-all duration-200
        `}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
            <LogOut size={16} />
          </div>
          <span className="hidden xl:block ml-4 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Bible Section Selector
  const SectionSelector = ({ id, title, icon, isActive }: { id: string; title: string; icon: React.ReactNode; isActive: boolean }) => (
    <button 
      onClick={() => setActiveSection(id)}
      className={`flex items-center space-x-2 p-2 rounded-md transition-all ${
        isActive ? 'bg-green-600 text-white font-medium' : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      {icon}
      <span>{title}</span>
    </button>
  );

  // Custom P2P Bible Content
  const popupModal = isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-80 transition-opacity duration-300">
      <div className="relative bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl h-4/5 flex flex-col overflow-hidden border border-green-500">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📜</span>
            <div>
              <h2 className="text-2xl font-bold text-green-400">The New Zealand P2P No-Scam Bible</h2>
              <p className="text-gray-400 text-sm">Written in the blood of countless scam victims of NZ P2P Crypto Marketplace v.1</p>
            </div>
          </div>
          <button
            onClick={closePopup}
            className="text-gray-400 hover:text-green-400 focus:outline-none p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto hidden md:block">
            <div className="flex flex-col space-y-1">
              <SectionSelector 
                id="intro" 
                title="Introduction" 
                icon={<Bookmark size={18} />} 
                isActive={activeSection === "intro"} 
              />
              <SectionSelector 
                id="commandments" 
                title="15 Commandments" 
                icon={<Shield size={18} />} 
                isActive={activeSection === "commandments"} 
              />
              <SectionSelector 
                id="what-is-p2p" 
                title="What is P2P Trading" 
                icon={<AlertTriangle size={18} />} 
                isActive={activeSection === "what-is-p2p"} 
              />
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 text-gray-200">
            {activeSection === "intro" && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-center space-x-2 mb-8">
                  <div className="h-1 bg-green-500 w-16 rounded-full"></div>
                  <h3 className="text-xl font-bold text-green-400">Introduction</h3>
                  <div className="h-1 bg-green-500 w-16 rounded-full"></div>
                </div>
                
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">⚠️</div>
                    <div>
                      <h4 className="text-red-400 font-bold text-lg mb-2">WARNING</h4>
                      <p className="text-gray-300">P2P is a scam cesspit. You're virtually guaranteed to encounter scammers. Scammers are rampant, frequently posing as existing reputable members and admins. None of this is financial advice.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 leading-relaxed">
                  <p className="text-lg font-medium text-green-300">This is the Kiwi user-manual to avoid getting scammed; the 15 commandments of NZ P2P crypto trading.</p>
                  
                  <p>Some may say these ways are extreme..</p>
                  
                  <p>But if followed, you can maximize your chances of safety, security and success.</p>
                  
                  <div className="py-2 px-4 bg-gray-800/50 border-l-4 border-green-500 rounded my-4">
                    <p className="italic font-medium">By default, always assume your P2P trading counterpart is a scammer.</p>
                  </div>
                  
                  <p>If you're given any reason to be suspicious, use your intuition and find another trader.</p>
                  
                  <p className="mt-6 text-gray-400">The commandments found in this guide were established through real experiences and lessons learned the hard way by the NZ crypto community.</p>
                </div>
              </div>
            )}

            {activeSection === "commandments" && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-center space-x-2 mb-8">
                  <div className="h-1 bg-green-500 w-16 rounded-full"></div>
                  <h3 className="text-xl font-bold text-green-400">The 15 Commandments</h3>
                  <div className="h-1 bg-green-500 w-16 rounded-full"></div>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">1. Assume Scammers</h4>
                    <p>By default, always assume your P2P trading counterpart is a scammer.</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">2. Trust Your Intuition</h4>
                    <p>If you're given any reason to be suspicious, use your intuition and find another trader.</p>
                  </div>

                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">3. Verify Identity</h4>
                    <p>Always verify the real life identity of your trader, essentially undertaking your own KYC due diligence background check on your counter-partner. If they don't feel comfortable with this, there are other traders who are willing to do this. KYC helps ensure you can follow up if the trade goes sour. Don't hesitate use voice or video calls, while being aware of ai text-to-speech technology.</p>
                  </div>

                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">4. Use Secure Payments</h4>
                    <p>Use secure payment methods that can not be reversed, i.e. cash or crypto. Note: it is possible to reverse bank transfers, this is extremely common, and it will leave you short changed in a situation you have 'sold crypto', sending it to the scammer, thereafter they reverse the NZD bank transfer.</p>
                  </div>

                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">5. Start Small</h4>
                    <p>Understand It's not a bad idea to test a potential P2P buyer or seller with $100, without overstating you want to purchase more. This will allow you to scam test a prospect trader, but also keep in mind scammers are willing to wait months before they close their trap and bail.</p>
                  </div>

                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">6. Be Skeptical of IDs</h4>
                    <p>Understand that identity documents can be faked, fabricated, stolen, bought or sold. Even if your trading counterpart has sent KYC 'proof of identity evidence', there's a very high chance those ID documents are not actually those of the person you are talking to. This is the reality of P2P trading.</p>
                  </div>

                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">7. Stay Local</h4>
                    <p>Never use a foreign / non Kiwi trader. Be suspect of foreign accents. Anyone accessing the NZ P2P Crypto Marketplace outside of NZ is obviously a scammer. Be aware of text to speech ai.</p>
                  </div>

                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">8. Meet in Person</h4>
                    <p>Meet your seller in the flesh, either on trade day or beforehand. This is the way to ensure they are who they say they are. P2P F2F cash/crypto trading is legal - you can do it inside a police station, a Cryptocurrency NZ monthly Meetup, public library or cafe. You are safest at day time in a secure location. Have mutual expectations. Make sure you both feel safe. Always verify, don't trust.</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-red-500">
                    <h4 className="font-bold text-lg text-red-300 mb-2">9. Physical Safety</h4>
                    <p>Be wary of meeting someone in the flesh - there is physical risk. A bad actor can potentially '$5 wrench attack' you and strong-arming your cash from you. This has happened here in New Zealand. You should be extremely aware of the physical risks of meeting a dodgy trader.</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">10. Stagger Large Trades</h4>
                    <p>Stagger large volumes over many trades. Never advertise large sums of cash or crypto or tell anyone how much crypto you own. Never do large trades straight away. This opens you up to risk. Consider starting with a small amount, then building up in multiple trades with a reliable partner.</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">11. Follow Community Rules</h4>
                    <p>Always follow the rules of the P2P Discord / community forum to prevent an unnecessary ban.</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">12. Learn From Others</h4>
                    <p>Learn from the positive and negative experiences of other NZ P2P traders to learn best practice.</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">13. Keep Records</h4>
                    <p>Keep a record of your P2P trades for documentation - you have to pay income tax on crypto gains.</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">14. Build Reputation</h4>
                    <p>Develop a long term, positive reputation for success and P2P accessibility. NZ is a small place and the future is forever. Treat your trading counterpart as if they were you. Make them feel safe.</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-5 border-l-4 border-green-500">
                    <h4 className="font-bold text-lg text-green-300 mb-2">15. Be Ethical</h4>
                    <p>Be a Jedi master and not an evil bastard.</p>
                  </div>
                  
                  <div className="bg-green-900/20 rounded-lg p-5 border border-green-700">
                    <div className="flex items-center justify-center mb-4">
                      <div className="h-px bg-green-500 w-12"></div>
                      <span className="mx-4 text-green-400 font-medium">Final Thoughts</span>
                      <div className="h-px bg-green-500 w-12"></div>
                    </div>
                    <p className="text-center">If you follow these rules religiously while equipped with working bullshit radar, you may find P2P success.</p>
                    <p className="text-center text-red-400 mt-2">Ignore these principles, and you are walking blind into the NZ crypto scam trenches.</p>
                    <p className="text-center mt-2">P2P doesn't have to be sketchy, but it's important you understand the risks at hand.</p>
                    <p className="text-center font-medium text-green-300 mt-3">Good luck, be safe, and long live P2P.</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 border-t border-gray-800 pt-4 mt-8">
                  <p>Note: this Bible is open-source, you are welcome to suggest amendments on the Discord. This project is a grassroots, community construction built on the shoulders of hundreds of Kiwis united by P2P F2F trading.</p>
                </div>
              </div>
            )}

            {activeSection === "what-is-p2p" && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-center space-x-2 mb-8">
                  <div className="h-1 bg-green-500 w-16 rounded-full"></div>
                  <h3 className="text-xl font-bold text-green-400">What is P2P Trading</h3>
                  <div className="h-1 bg-green-500 w-16 rounded-full"></div>
                </div>
                
                <div className="space-y-4 leading-relaxed">
                  <p>P2P (peer-to-peer) crypto trading is the act of buying or selling cryptocurrency directly between two traders, without the use of a middleman to facilitate the transaction process.</p>
                  
                  <p>A P2P crypto trader is any individual who buys and sells cryptocurrency directly between other crypto users, instead of buying directly through a centralized exchange or retailer.</p>
                  
                  <p>P2P is the rawest form of cryptocurrency trading available, providing more control over the trading process at the expense of the security and safety of traditional methods.</p>
                  
                  <div className="bg-gray-800 rounded-lg p-5 my-4">
                    <h4 className="font-bold text-lg text-green-300 mb-3">P2P Glossary</h4>
                    <ul className="space-y-2">
                      <li><span className="text-green-400 font-medium">P2P:</span> Peer-to-peer</li>
                      <li><span className="text-green-400 font-medium">IRL:</span> In real life</li>
                      <li><span className="text-green-400 font-medium">F2F:</span> Face to face</li>
                      <li><span className="text-green-400 font-medium">KYC:</span> Know your customer</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-5 my-6">
                    <h4 className="text-red-400 font-bold text-lg mb-2">WARNING</h4>
                    <p>P2P is a scam cesspit, you are virtually guaranteed to encounter scammers. It is highly recommended to read the NZ P2P Scam Bible to understand the realities and risks of P2P trading. The most common and safest way to acquire crypto in NZ is through a regulated crypto exchange.</p>
                    <p className="mt-3 font-medium">P2P is an evolving minefield of scams. Beware, scam is real and P2P is a magnet for it.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation for Bible sections */}
        <div className="md:hidden border-t border-gray-800 bg-gray-900 p-2">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveSection("intro")}
              className={`px-3 py-1.5 rounded-md flex items-center ${activeSection === "intro" ? "bg-green-600 text-white" : "text-gray-400"}`}
            >
              <Bookmark size={16} className="mr-1" />
              <span className="text-sm">Intro</span>
            </button>
            <button
              onClick={() => setActiveSection("commandments")}
              className={`px-3 py-1.5 rounded-md flex items-center ${activeSection === "commandments" ? "bg-green-600 text-white" : "text-gray-400"}`}
            >
              <Shield size={16} className="mr-1" />
              <span className="text-sm">Rules</span>
            </button>
            <button
              onClick={() => setActiveSection("what-is-p2p")}
              className={`px-3 py-1.5 rounded-md flex items-center ${activeSection === "what-is-p2p" ? "bg-green-600 text-white" : "text-gray-400"}`}
            >
              <AlertTriangle size={16} className="mr-1" />
              <span className="text-sm">About</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileNavbar}
      {desktopSidebar}
      {popupModal}
      {/* Content padding - adds margin for the navbar/sidebar */}
      <div className="md:pl-20 xl:pl-64"></div>
    </>
  );
}

// Navigation item component
interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  label: string;
  sidebar?: boolean;
  highlight?: boolean;
}

function NavItem({
  href,
  icon,
  active,
  label,
  sidebar,
  highlight,
}: NavItemProps) {
  // Mobile version (bottom navigation)
  if (!sidebar) {
    return (
      <Link href={href} className="flex items-center justify-center">
        <div
          className={`
          flex items-center justify-center
          ${active ? "text-green-400" : "text-gray-400"}
          ${active && "relative"}
        `}
        >
          {icon}
          {active && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400"></div>
          )}
        </div>
      </Link>
    );
  }

  // Sidebar version
  return (
    <Link
      href={href}
      className={`
        flex items-center xl:px-6 py-3 mx-3
        ${
          active || highlight
            ? "text-green-400"
            : "text-gray-400 hover:text-green-400"
        }
        ${active && "bg-gray-800/80 rounded-lg"}
        ${highlight && !active && "bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg"}
        ${!active && !highlight && "hover:bg-gray-800/50 rounded-lg"}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-center w-full xl:w-auto xl:justify-start">
        <div
          className={`
          flex-shrink-0
          ${highlight && "text-green-400"}
        `}
        >
          {icon}
        </div>
        <span className="hidden xl:block ml-4 font-medium">{label}</span>
      </div>
    </Link>
  );
}