"use client";

import { useState } from "react";
import { communicationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type Thread = {
  id: string;
  teacher: { id: number; name: string; role: string; subject: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type Message = {
  id: number;
  sender: string;
  content: string;
  time: string;
  read: boolean;
};

export default function ParentCommunicationPage() {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;
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
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No conversations yet
            </div>
          </div>
        </div>

        {/* Message Area */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-bold text-neutral-800">
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
                          ? "bg-neutral-100 text-white rounded-tr-none"
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "parent" ? "text-neutral-800" : "text-gray-400"}`}>
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
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-black hover:bg-neutral-800 text-white h-10 w-10 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-200" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
