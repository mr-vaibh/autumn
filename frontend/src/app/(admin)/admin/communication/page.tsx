"use client";

import { useState, useEffect } from "react";
import { communicationApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bell, MessageSquare, Pin } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  { id: 1, title: "Annual Day Celebrations - 2024", body: "Dear parents and staff, we are pleased to announce our Annual Day celebration on June 15th, 2024. All students are requested to participate in the cultural programs.", created_by_name: "Admin", target: "all", is_active: true, is_pinned: true, created_at: "2024-05-20T10:00:00Z" },
  { id: 2, title: "Summer Schedule Changes", body: "Please note that due to the summer vacation, class schedules will be modified from June 1st. The new schedule is attached.", created_by_name: "Admin", target: "parents", is_active: true, is_pinned: false, created_at: "2024-05-18T14:30:00Z" },
  { id: 3, title: "Staff Meeting - May 30th", body: "All teaching staff are reminded about the monthly staff meeting scheduled for May 30th at 4:00 PM in the conference room.", created_by_name: "Admin", target: "teachers", is_active: true, is_pinned: false, created_at: "2024-05-17T09:00:00Z" },
  { id: 4, title: "Parent-Teacher Meeting", body: "The quarterly parent-teacher meeting will be held on June 8th from 10 AM to 2 PM. Parents are requested to bring their child's progress report.", created_by_name: "Admin", target: "all", is_active: true, is_pinned: false, created_at: "2024-05-15T11:00:00Z" },
];

const targetColors: Record<string, "purple" | "info" | "success"> = {
  all: "purple",
  teachers: "info",
  parents: "success",
  class: "warning" as "success",
};

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communicationApi.getAnnouncements()
      .then((res) => setAnnouncements(res.data.results || res.data))
      .catch(() => setAnnouncements(mockAnnouncements))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
          <p className="text-sm text-gray-500 mt-0.5">Announcements, messages, and notifications</p>
        </div>
        <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

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
              <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {ann.is_pinned && (
                        <Pin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      )}
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
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-xs">Edit</Button>
                    <Button size="sm" variant="outline" className="text-xs text-red-600 hover:text-red-700">Delete</Button>
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
