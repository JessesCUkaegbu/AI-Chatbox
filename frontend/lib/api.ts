export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type ChatResponse = {
  reply: string;
};

export type AuthResponse = {
  token: string;
  user: {
    email: string;
    name?: string | null;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name?: string;
  email: string;
  password: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const CHAT_PROVIDER =
  process.env.NEXT_PUBLIC_CHAT_PROVIDER?.toLowerCase() ?? "gpt";

const AUTH_TOKEN_KEY = "jesschat_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function sendChatMessage(message: string): Promise<ChatMessage> {
  const endpoint = CHAT_PROVIDER === "gemini" ? "/chat" : "/chat/gpt";
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });

  const data = (await response.json()) as ChatResponse & { detail?: string };

  if (!response.ok) {
    const detail = data?.detail ?? "Server error.";
    throw new Error(detail);
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: data.reply,
  };
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AuthResponse & { detail?: string };
  if (!response.ok) {
    const detail = data?.detail ?? "Unable to log in.";
    throw new Error(detail);
  }

  setAuthToken(data.token);
  return data;
}

export async function signupUser(
  payload: SignupPayload
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AuthResponse & { detail?: string };
  if (!response.ok) {
    const detail = data?.detail ?? "Unable to create account.";
    throw new Error(detail);
  }

  setAuthToken(data.token);
  return data;
}
