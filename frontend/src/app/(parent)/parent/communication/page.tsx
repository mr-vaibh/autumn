"use client";

import { useState } from "react";
import { communicationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const mockThreads = [
  {
    id: "thread-1",
    teacher: { id: 1, name: "Priya Singh", role: "TEACHER", subject: "Speech Therapist" },
    lastMessage: "Arjun did great in today's session! He named 8 objects correctly.",
    lastMessageAt: "2024-05-22T14:30:00Z",
    unreadCount: 1,
  },
  {
    id: "thread-2",
    teacher: { id: 2, name: "Rahul Kumar", role: "THERAPIST", subject: "Occupational Therapist" },
    lastMessage: "Please ensure Arjun practices the pincer grip exercises at home.",
    lastMessageAt: "2024-05-21T10:00:00Z",
    unreadCount: 0,
  },
  {
    id: "thread-3",
    teacher: { id: 3, name: "Admin", role: "ADMIN", subject: "School Admin" },
    lastMessage: "Reminder: Parent-teacher meeting on June 8th at 10 AM.",
    lastMessageAt: "2024-05-20T09:00:00Z",
    unreadCount: 0,
  },
];

const mockMessages = [
  { id: 1, sender: "teacher", content: "Good morning! Arjun did exceptionally well today. He named 8 out of 10 objects in the picture book.", time: "2024-05-22T14:30:00Z", read: true },
  { id: 2, sender: "parent", content: "That's wonderful news! He was practicing at home with the flash cards you suggested.", time: "2024-05-22T14:45:00Z", read: true },
  { id: 3, sender: "teacher", content: "That really shows! Home practice makes a big difference. Please continue with the consonant sound exercises.", time: "2024-05-22T15:00:00Z", read: false },
];

export default function ParentCommunicationPage() {
  const [selectedThread, setSelectedThread] = useState(mockThreads[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await communicationApi.sendMessage({
        recipient: selectedThread.teacher.id,
        content: newMessage,
        thread_id: selectedThread.id,
      });
      setMessages((prev) => [...prev, {
        id: Date.now(),
        sender: "parent",
        content: newMessage,
        time: new Date().toISOString(),
        read: true,
      }]);
      setNewMessage("");
    } catch {
      // Mock add
      setMessages((prev) => [...prev, {
        id: Date.now(),
        sender: "parent",
        content: newMessage,
        time: new Date().toISOString(),
        read: true,
      }]);
      setNewMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
        <p className="text-sm text-gray-500 mt-0.5">Chat with your child&apos;s teachers and therapists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        {/* Thread List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {mockThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedThread.id === thread.id ? "bg-purple-50 border-l-2 border-purple-500" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700 flex-shrink-0">
                    {thread.teacher.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm truncate">{thread.teacher.name}</p>
                      {thread.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{thread.teacher.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{thread.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Area */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
              {selectedThread.teacher.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedThread.teacher.name}</p>
              <p className="text-xs text-gray-400">{selectedThread.teacher.subject}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "parent" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "parent"
                      ? "bg-purple-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender === "parent" ? "text-purple-300" : "text-gray-400"}`}>
                    {new Date(msg.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 h-10 w-10 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
