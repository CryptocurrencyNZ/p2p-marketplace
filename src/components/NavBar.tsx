"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MapPin, MessageCircle, Plus, Bell, User, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // Mobile navbar (Instagram-like)
  const mobileNavbar = (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-gray-900 border-t border-gray-800 flex items-center justify-around z-50 md:hidden">
      <NavItem
        href="/dashboard"
        icon={<MapPin size={20} />}
        active={isActive("/dashboard")}
        label="Map"
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
    </div>
  );

  // Desktop sidebar
  const desktopSidebar = (
    <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 xl:w-64 bg-gray-900 border-r border-gray-800 flex-col z-50">
      {/* Logo */}
      <div className="flex justify-center xl:justify-start items-center h-20 xl:px-6 border-b border-gray-800">
        <div className="w-10 h-10 xl:mr-3 flex-shrink-0 relative">
          <Image
            src="/CNZ_logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-green-500/0 via-green-500/70 to-green-500/0 blur-sm"></div>
        </div>
        <span className="hidden xl:block text-xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
          CNZ P2P
        </span>
      </div>

      {/* Nav items */}
      <div className="flex flex-col flex-1 pt-6 space-y-2">
        <NavItem
          href="/dashboard"
          icon={<MapPin size={24} />}
          active={isActive("/dashboard")}
          label="Map"
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
          highlight
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

  return (
    <>
      {mobileNavbar}
      {desktopSidebar}
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
