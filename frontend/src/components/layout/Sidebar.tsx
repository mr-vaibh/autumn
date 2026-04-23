"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, GraduationCap, Calendar, FileText,
  ClipboardCheck, CreditCard, MessageSquare, BarChart3,
  Utensils, ChevronLeft, ChevronRight, LogOut, Settings,
  BookOpen, UserCheck, School, Bell
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: GraduationCap },
  { label: "Staff", href: "/admin/staff", icon: Users },
  { label: "Classes", href: "/admin/classes", icon: School },
  { label: "Timetable", href: "/admin/timetable", icon: Calendar },
  { label: "Fees", href: "/admin/fees", icon: CreditCard },
  { label: "Communication", href: "/admin/communication", icon: MessageSquare },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

const teacherNavItems: NavItem[] = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "My Timetable", href: "/teacher/timetable", icon: Calendar },
  { label: "Session Reports", href: "/teacher/sessions", icon: FileText },
  { label: "My Students", href: "/teacher/students", icon: GraduationCap },
  { label: "Attendance", href: "/teacher/attendance", icon: UserCheck },
];

const parentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: LayoutDashboard },
  { label: "Session Reports", href: "/parent/sessions", icon: FileText },
  { label: "Progress", href: "/parent/progress", icon: BarChart3 },
  { label: "Fees", href: "/parent/fees", icon: CreditCard },
  { label: "Communication", href: "/parent/communication", icon: MessageSquare },
];

function getNavItems(role: string): NavItem[] {
  if (role === "ADMIN") return adminNavItems;
  if (role === "TEACHER" || role === "THERAPIST" || role === "DIETICIAN") return teacherNavItems;
  if (role === "PARENT") return parentNavItems;
  return [];
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = user ? getNavItems(user.role) : [];

  return (
    <aside
      className={cn(
        "flex flex-col bg-gradient-to-b from-purple-950 to-purple-900 text-white transition-all duration-300 ease-in-out min-h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center border-b border-purple-700/50 p-4", collapsed ? "justify-center" : "gap-3")}>
        <div className="w-10 h-10 bg-purple-600/50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
          🌟
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white leading-tight">GLOBAL AUTISM</p>
            <p className="text-xs text-purple-300">Learning School</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/teacher" && item.href !== "/parent" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link text-purple-200",
                isActive && "active",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-purple-700/50 p-2 space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
            <p className="text-xs text-purple-300 capitalize">{user.role.toLowerCase()}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "w-full sidebar-link text-purple-300 hover:text-white hover:bg-red-600/30",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full sidebar-link text-purple-300 hover:text-white",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
