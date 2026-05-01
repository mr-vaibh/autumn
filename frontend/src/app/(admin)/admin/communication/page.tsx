"use client";

import { useState, useEffect } from "react";
import { communicationApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bell, MessageSquare, Pin, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Announcement {
  id: number;
  title: string;
  body: string;
  created_by_name: string;
  target: string;
  is_active: boolean;
  is_pinned: boolean;
  created_at: string;
}

const mockAnnouncements: Announcement[] = [
  { id: 1, title: "Annual Day Celebrations - 2024", body: "Dear parents and staff, we are pleased to announce our Annual Day celebration on June 15th, 2024.", created_by_name: "Admin", target: "all", is_active: true, is_pinned: true, created_at: "2024-05-20T10:00:00Z" },
  { id: 2, title: "Summer Schedule Changes", body: "Please note that due to the summer vacation, class schedules will be modified from June 1st.", created_by_name: "Admin", target: "parents", is_active: true, is_pinned: false, created_at: "2024-05-18T14:30:00Z" },
  { id: 3, title: "Staff Meeting - May 30th", body: "All teaching staff are reminded about the monthly staff meeting scheduled for May 30th at 4:00 PM.", created_by_name: "Admin", target: "teachers", is_active: true, is_pinned: false, created_at: "2024-05-17T09:00:00Z" },
];

const targetColors: Record<string, "purple" | "info" | "success"> = {
  all: "purple",
  teachers: "info",
  parents: "success",
};

const emptyForm = { title: "", body: "", target: "all" };

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newAnn, setNewAnn] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteAnn, setDeleteAnn] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnouncements = () => {
    setLoading(true);
    communicationApi.getAnnouncements()
      .then((res) => setAnnouncements(res.data.results || res.data))
      .catch(() => setAnnouncements(mockAnnouncements))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await communicationApi.createAnnouncement(newAnn);
      toast.success("Announcement created");
      setCreateOpen(false);
      setNewAnn(emptyForm);
      fetchAnnouncements();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to create";
      toast.error(msg as string);
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const openEdit = (ann: Announcement) => {
    setEditAnn(ann);
    setEditForm({ title: ann.title, body: ann.body, target: ann.target });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAnn) return;
    setSaving(true);
    try {
      await communicationApi.updateAnnouncement(editAnn.id, editForm);
      toast.success("Announcement updated");
      setEditAnn(null);
      fetchAnnouncements();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : "Failed to update";
      toast.error(msg as string);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteAnn) return;
    setDeleting(true);
    try {
      await communicationApi.deleteAnnouncement(deleteAnn.id);
      toast.success("Announcement deleted");
      setDeleteAnn(null);
      setAnnouncements((prev) => prev.filter((a) => a.id !== deleteAnn.id));
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
          <p className="text-sm text-gray-500 mt-0.5">Announcements, messages, and notifications</p>
        </div>
        <Button size="sm" className="gap-2 bg-black hover:bg-neutral-800 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {/* ── Create Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) setNewAnn(emptyForm); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="c-title">Title *</Label>
              <Input id="c-title" required value={newAnn.title} onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-body">Body *</Label>
              <textarea
                id="c-body" required rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                value={newAnn.body}
                onChange={(e) => setNewAnn({ ...newAnn, body: e.target.value })}
                placeholder="Write your announcement..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-target">Audience</Label>
              <select id="c-target" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newAnn.target} onChange={(e) => setNewAnn({ ...newAnn, target: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="teachers">Teachers only</option>
                <option value="parents">Parents only</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-black text-white hover:bg-neutral-800">
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={!!editAnn} onOpenChange={(v) => { if (!v) setEditAnn(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e-title">Title *</Label>
              <Input id="e-title" required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-body">Body *</Label>
              <textarea
                id="e-body" required rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                value={editForm.body}
                onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-target">Audience</Label>
              <select id="e-target" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.target} onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="teachers">Teachers only</option>
                <option value="parents">Parents only</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditAnn(null)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-neutral-800">
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!deleteAnn} onOpenChange={(v) => { if (!v) setDeleteAnn(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Announcement</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 mt-1">
            Are you sure you want to delete <strong>&ldquo;{deleteAnn?.title}&rdquo;</strong>? This cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteAnn(null)}>Cancel</Button>
            <Button disabled={deleting} onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements" className="gap-2">
            <Bell className="w-4 h-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-800 rounded-full animate-spin"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No announcements yet.</div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {ann.is_pinned && <Pin className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                      <h3 className="font-bold text-gray-900">{ann.title}</h3>
                      <Badge variant={targetColors[ann.target] || "secondary"}>
                        {ann.target === "all" ? "Everyone" : ann.target}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{ann.body}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>By {ann.created_by_name}</span>
                      <span>•</span>
                      <span>{formatDate(ann.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm" variant="outline" className="gap-1.5 text-xs"
                      onClick={() => openEdit(ann)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm" variant="outline" className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                      onClick={() => setDeleteAnn(ann)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">Direct messaging between staff and parents</p>
              <p className="text-xs text-gray-300 mt-1">Select a conversation from the list to view messages</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
