"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: string;
  lastMessageAt: string;
}

export default function MessagesPage() {
  const { data: session }: any = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.user.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConversation) {
        //   setActiveConversation(data[0]); // Don't auto-select to show empty state
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherId: string) => {
    try {
      const res = await fetch(`/api/messages?userId=${otherId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: activeConversation.user.id,
          content: newMessage
        })
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages([...messages, msg]);
        setNewMessage("");
        // Update conversation list last message
        setConversations(prev => prev.map(conv => 
          conv.user.id === activeConversation.user.id 
            ? { ...conv, lastMessage: newMessage, lastMessageAt: new Date().toISOString() }
            : conv
        ));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (!session) return null;

  return (
    <div className="bg-surface min-h-screen text-on-surface antialiased font-['Inter']">
      <Navbar />
      <Sidebar role={session.user.role} />

      <main className="ml-64 pt-[72px] h-screen flex overflow-hidden">
        {/* Left: Conversation List */}
        <div className="w-[380px] border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest">
          <div className="p-6 border-b border-outline-variant/20">
            <h1 className="text-xl font-black mb-4">Tin nhắn</h1>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm hội thoại..." 
                className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-full text-sm outline-none border border-transparent focus:border-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">chat_bubble</span>
                <p className="text-xs">Chưa có hội thoại nào</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-surface-container transition-colors text-left border-l-4 ${
                    activeConversation?.user.id === conv.user.id ? 'border-primary bg-primary/5' : 'border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.user.avatar ? (
                      <img src={conv.user.avatar} className="w-12 h-12 rounded-full object-cover border border-outline-variant/20" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {conv.user.name[0]}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-sm font-bold truncate">{conv.user.name}</h3>
                      <span className="text-[10px] text-on-surface-variant">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: vi })}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat Window */}
        <div className="flex-1 flex flex-col bg-surface overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-[72px] border-b border-outline-variant/20 px-6 flex items-center justify-between bg-surface-container-lowest/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {activeConversation.user.avatar ? (
                      <img src={activeConversation.user.avatar} className="w-10 h-10 rounded-full object-cover border border-outline-variant/20" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {activeConversation.user.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-black">{activeConversation.user.name}</h2>
                    <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Đang trực tuyến
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined">call</span>
                  </button>
                  <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined">videocam</span>
                  </button>
                  <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined">info</span>
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-mesh">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40">
                    <span className="material-symbols-outlined text-6xl mb-4">forum</span>
                    <p className="text-sm italic">Hãy bắt đầu câu chuyện của bạn...</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === userId;
                    const showAvatar = idx === 0 || messages[idx-1].senderId !== msg.senderId;
                    
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`shrink-0 w-8 ${!isMe && !showAvatar ? 'opacity-0' : ''}`}>
                            {!isMe && showAvatar && (
                               activeConversation.user.avatar ? (
                                <img src={activeConversation.user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                               ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">
                                  {activeConversation.user.name[0]}
                                </div>
                               )
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                              isMe 
                                ? 'bg-primary text-on-primary rounded-br-none' 
                                : 'bg-surface-container-high text-on-surface rounded-bl-none border border-outline-variant/10'
                            }`}>
                              {msg.content}
                            </div>
                            <span className={`text-[9px] text-on-surface-variant px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 bg-surface-container-lowest/80 backdrop-blur-md">
                <form 
                  onSubmit={handleSend}
                  className="bg-surface-container rounded-2xl flex items-end gap-2 p-2 border border-outline-variant/20 shadow-sm focus-within:border-primary/20 transition-all"
                >
                  <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">add_circle</span>
                  </button>
                  <textarea
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent py-2.5 px-1 text-sm outline-none resize-none max-h-32"
                  />
                  <div className="flex items-center gap-1 mb-1 mr-1">
                    <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">mood</span>
                    </button>
                    <button 
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2 bg-primary text-on-primary rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                    >
                      {sending ? (
                         <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-symbols-outlined">send</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant/40 bg-mesh">
              <div className="w-32 h-32 rounded-full bg-surface-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-6xl">chat_bubble_outline</span>
              </div>
              <h2 className="text-xl font-black text-on-surface/40">Kênh trò chuyện FreelanceAI</h2>
              <p className="text-sm max-w-xs text-center mt-2 leading-relaxed">
                Chọn một hội thoại bên trái để bắt đầu thảo luận về dự án của bạn.
              </p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
