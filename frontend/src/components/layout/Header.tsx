"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getBreadcrumb(pathname: string): string[] {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part) => {
    const formatted = part.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return formatted;
  });
}

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const breadcrumbs = getBreadcrumb(pathname);
  const [notifCount] = useState(3);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
            <span className={idx === breadcrumbs.length - 1 ? "text-gray-800 font-semibold" : "text-gray-400"}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-400">
          <Search className="w-4 h-4" />
          <span>Quick search...</span>
          <kbd className="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {notifCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profile_pic || undefined} />
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                  {getInitials(user?.full_name || "?")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.full_name}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role?.toLowerCase()}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Change Password</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={logout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
