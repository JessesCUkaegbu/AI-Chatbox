"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  clearAuthToken,
  getAuthToken,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/api";

type ChatListItem = {
  id: string;
  title: string;
  createdAt: number;
  lastUpdated: number;
};

const starterMessages: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    text: "Hey Jess, welcome back. Want to continue the build from yesterday?",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasLoadedChats, setHasLoadedChats] = useState(false);

  const messages = useMemo(
    () => chatMessages[activeChatId] ?? [],
    [chatMessages, activeChatId]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedChats = window.localStorage.getItem("jesschat_chats");
    const storedMessages = window.localStorage.getItem("jesschat_messages");
    const storedActive = window.localStorage.getItem("jesschat_active_chat");

    if (storedChats && storedMessages) {
      try {
        const parsedChats = JSON.parse(storedChats) as ChatListItem[];
        const parsedMessages = JSON.parse(storedMessages) as Record<
          string,
          ChatMessage[]
        >;
        setChats(parsedChats);
        setChatMessages(parsedMessages);
        setActiveChatId(
          storedActive && parsedChats.some((chat) => chat.id === storedActive)
            ? storedActive
            : parsedChats[0]?.id ?? ""
        );
        setHasLoadedChats(true);
        return;
      } catch {
        // fall through to default seed
      }
    }

    const seedId = crypto.randomUUID();
    setChats([
      {
        id: seedId,
        title: "Welcome chat",
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      },
    ]);
    setChatMessages({ [seedId]: starterMessages });
    setActiveChatId(seedId);
    setHasLoadedChats(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedChats || typeof window === "undefined") return;
    window.localStorage.setItem("jesschat_chats", JSON.stringify(chats));
    window.localStorage.setItem("jesschat_messages", JSON.stringify(chatMessages));
    if (activeChatId) {
      window.localStorage.setItem("jesschat_active_chat", activeChatId);
    }
  }, [chats, chatMessages, activeChatId, hasLoadedChats]);

  const redirectToLogin = (message?: string) => {
    if (message) {
      setError(message);
    }
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/login");
    }, 250);
  };

  const handleNewChat = () => {
    const newChatId = crypto.randomUUID();
    const timestamp = Date.now();
    const newChatTitle = `New chat ${chats.length + 1}`;
    setChats((prev) => [
      {
        id: newChatId,
        title: newChatTitle,
        createdAt: timestamp,
        lastUpdated: timestamp,
      },
      ...prev,
    ]);
    setChatMessages((prev) => ({
      ...prev,
      [newChatId]: starterMessages,
    }));
    setActiveChatId(newChatId);
    setError(null);
  };

  const updateChatTitleFromMessage = (message: string) => {
    const title = message.trim().slice(0, 32);
    if (!title) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, title: title.length < 32 ? title : `${title}...` }
          : chat
      )
    );
  };

  const updateChatTimestamp = () => {
    const timestamp = Date.now();
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, lastUpdated: timestamp } : chat
      )
    );
  };

  const handleDeleteChat = (chatId: string) => {
    const remaining = chats.filter((chat) => chat.id !== chatId);
    const needsSeed = remaining.length === 0;
    const nextActiveId = needsSeed
      ? ""
      : chatId === activeChatId
        ? remaining[0].id
        : activeChatId;

    if (needsSeed) {
      const seedId = crypto.randomUUID();
      const timestamp = Date.now();
      setChats([
        {
          id: seedId,
          title: "Welcome chat",
          createdAt: timestamp,
          lastUpdated: timestamp,
        },
      ]);
      setChatMessages({ [seedId]: starterMessages });
      setActiveChatId(seedId);
      return;
    }

    setChats(remaining);
    setChatMessages((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
    setActiveChatId(nextActiveId);
  };

  const handleSend = async () => {
    const token = getAuthToken();
    if (!token) {
      redirectToLogin("Please log in to start chatting.");
      return;
    }

    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), userMessage],
    }));
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      updateChatTitleFromMessage(trimmed);
      updateChatTimestamp();
      const assistantMessage = await sendChatMessage(trimmed);
      setChatMessages((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] ?? []), assistantMessage],
      }));
      updateChatTimestamp();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to reach the server.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsSettingsOpen(false);
    redirectToLogin("You have been logged out.");
  };

  return (
    <main className="min-h-screen w-full bg-transparent p-0 md:p-4">
      <div
        className={`mx-auto flex h-screen w-full max-w-6xl overflow-hidden rounded-none border border-black/10 bg-card shadow-soft transition-opacity duration-300 md:h-[92vh] md:rounded-3xl ${
          isRedirecting ? "opacity-0" : "opacity-100"
        }`}
      >
        <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-black/10 bg-white/70 p-5 backdrop-blur md:flex">
          <div className="mb-6 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Workspace
            </p>
            <h1 className="text-xl font-semibold">Jess Chat</h1>
          </div>

          <button
            className="mb-5 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            onClick={handleNewChat}
          >
            + New chat
          </button>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Recent
            </p>
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition ${
                    chat.id === activeChatId
                      ? "border-brand/40 bg-white text-ink"
                      : "border-transparent bg-white/80 text-ink hover:border-black/10 hover:bg-white"
                  }`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="line-clamp-1">{chat.title}</p>
                      <p className="text-xs font-normal text-muted">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(chat.lastUpdated)}
                      </p>
                    </div>
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-red-500"
                      role="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M6 6l1 14h10l1-14" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl bg-brand/10 p-4 text-sm text-muted">
              Tip: Ask for information about your city and local attractions.
            </div>
            <div className="relative">
              <button
                className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-muted transition hover:border-black/20"
                onClick={() => setIsSettingsOpen((prev) => !prev)}
              >
                Settings
              </button>
              {isSettingsOpen && (
                <div className="absolute bottom-12 left-0 w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-black/5"
                    type="button"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M20 21a8 8 0 0 0-16 0" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    Profile
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-black/5"
                    type="button"
                    onClick={handleLogout}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                    </span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="flex h-full flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-black/10 bg-white/80 px-6 py-4 backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Active chat
              </p>
              <h2 className="text-lg font-semibold">
                Get to know more about your city
              </h2>
            </div>
            <button className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-muted transition hover:border-black/20">
              Share
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-white/40 px-6 py-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "bg-brand text-white"
                      : "bg-[#fff3ee] text-ink"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                Error: {error}
              </div>
            )}
          </div>

          <div className="border-t border-black/10 bg-white px-6 py-4">
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
              <input
                className="flex-1 border-0 bg-transparent text-sm outline-none"
                placeholder="Type a message..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-brand/60"
                onClick={handleSend}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
