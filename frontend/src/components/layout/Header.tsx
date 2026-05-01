"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, Search, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials, formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { communicationApi, usersApi } from "@/lib/api";
import api from "@/lib/api";
import toast from "react-hot-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

// ─── Quick-search data ───────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: "Students", path: "/admin/students" },
  { label: "Staff", path: "/admin/staff" },
  { label: "Classes", path: "/admin/classes" },
  { label: "Fees", path: "/admin/fees" },
  { label: "Communication", path: "/admin/communication" },
  { label: "Reports", path: "/admin/reports" },
  { label: "Timetable", path: "/admin/timetable" },
];

// ─── Mock notifications (fallback) ───────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "New announcement",
    message: "School will remain closed on Friday for a public holiday.",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    is_read: false,
  },
  {
    id: 2,
    title: "Fee reminder",
    message: "Term 2 fees are due by end of this month.",
    created_at: new Date(Date.now() - 86400 * 1000).toISOString(),
    is_read: false,
  },
  {
    id: 3,
    title: "Session report submitted",
    message: "A new therapy session report has been submitted for review.",
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    is_read: true,
  },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

function getBreadcrumb(pathname: string): string[] {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part) =>
    part.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatDate(dateStr);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Quick-search dialog */
function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const listRef = useRef<HTMLUListElement>(null);

  const results = query.trim()
    ? QUICK_LINKS.filter((l) =>
        l.label.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_LINKS;

  // Reset when results change
  useEffect(() => { setActiveIndex(0); }, [results.length]);

  // Reset on close
  useEffect(() => {
    if (!open) { setQuery(""); setActiveIndex(0); }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function handleSelect(path: string) {
    router.push(path);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) handleSelect(results[activeIndex].path);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => { setQuery(""); setActiveIndex(0); }}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <ul ref={listRef} className="py-1 max-h-72 overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400">No results found</li>
          )}
          {results.map((link, idx) => (
            <li key={link.path}>
              <button
                data-active={idx === activeIndex ? "true" : "false"}
                onClick={() => handleSelect(link.path)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                  idx === activeIndex
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronRight className={`w-3.5 h-3.5 ${idx === activeIndex ? "text-white" : "text-gray-400"}`} />
                {link.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 flex gap-3">
          <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">↑↓</kbd> navigate</span>
          <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">↵</kbd> select</span>
          <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Esc</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Notifications panel */
function NotificationsDialog({
  open,
  onClose,
  onCountChange,
}: {
  open: boolean;
  onClose: () => void;
  onCountChange: (n: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communicationApi.getNotifications();
      const data: Notification[] = Array.isArray(res.data)
        ? res.data
        : res.data?.results ?? [];
      setNotifications(data);
      onCountChange(data.filter((n) => !n.is_read).length);
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
      onCountChange(MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  async function handleMarkAllRead() {
    setMarking(true);
    try {
      await communicationApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onCountChange(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    } finally {
      setMarking(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-gray-800">
              Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={marking}
                className="text-xs text-gray-500 hover:text-gray-800 h-auto py-1 px-2"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
          {loading && (
            <li className="px-4 py-6 text-sm text-center text-gray-400">
              Loading...
            </li>
          )}
          {!loading && notifications.length === 0 && (
            <li className="px-4 py-6 text-sm text-center text-gray-400">
              No notifications
            </li>
          )}
          {!loading &&
            notifications.map((n) => (
              <li
                key={n.id}
                className={`px-4 py-3 ${!n.is_read ? "bg-gray-50" : ""}`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && (
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                  )}
                  {n.is_read && <span className="mt-1.5 w-1.5 h-1.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/** Profile settings dialog */
function ProfileSettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    designation: "",
    department: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      const [first, ...rest] = (user.full_name || "").split(" ");
      setForm({
        first_name: first || "",
        last_name: rest.join(" "),
        phone: (user as Record<string, unknown>).phone as string || "",
        designation: (user as Record<string, unknown>).designation as string || "",
        department: (user as Record<string, unknown>).department as string || "",
      });
    }
  }, [open, user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.updateMe(form);
      await refreshUser();
      toast.success("Profile updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="e.g. Senior Teacher"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Science"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-black text-white hover:bg-neutral-800"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Change password dialog */
function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open)
      setForm({ old_password: "", new_password: "", confirm_password: "" });
  }, [open]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    if (!form.new_password || form.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/users/${user?.id}/change_password/`, {
        old_password: form.old_password,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      });
      toast.success("Password changed successfully");
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr.response?.data;
      const msg = data
        ? Object.values(data).flat().join(" ")
        : "Failed to change password";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="old_password">Current Password</Label>
            <Input
              id="old_password"
              name="old_password"
              type="password"
              value={form.old_password}
              onChange={handleChange}
              placeholder="Current password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              value={form.new_password}
              onChange={handleChange}
              placeholder="New password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Repeat new password"
              required
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-black text-white hover:bg-neutral-800"
            >
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Header ─────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const breadcrumbs = getBreadcrumb(pathname);

  const [notifCount, setNotifCount] = useState(0);

  // Dialog open states
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  // Fetch unread count on mount
  useEffect(() => {
    communicationApi
      .getUnreadCount()
      .then((res) => {
        const count =
          typeof res.data?.count === "number"
            ? res.data.count
            : typeof res.data?.unread_count === "number"
            ? res.data.unread_count
            : 0;
        setNotifCount(count);
      })
      .catch(() => {
        // leave count at 0 if endpoint fails
      });
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? "text-gray-800 font-semibold"
                    : "text-gray-400"
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Quick search...</span>
            <kbd className="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications bell */}
          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profile_pic || undefined} />
                  <AvatarFallback className="bg-neutral-100 text-neutral-700 text-xs font-semibold">
                    {getInitials(user?.full_name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-none">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
                Change Password
              </DropdownMenuItem>
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

      {/* Dialogs — rendered outside the header so z-index is not clipped */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      <NotificationsDialog
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onCountChange={setNotifCount}
      />

      <ProfileSettingsDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </>
  );
}
