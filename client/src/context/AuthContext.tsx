import { type User } from "@/types";
import {
  getMeApi,
  guestLoginApi,
  logoutApi,
  updateProfileApi,
} from "@/utils/api";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginAsGuest: (username?: string) => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Decode user directly from JWT payload for instant UI rendering
const decodeUserFromToken = (tokenStr: string | null): User | null => {
  if (!tokenStr) return null;
  try {
    const parts = tokenStr.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.userId && payload.email) {
      return {
        id: payload.userId,
        email: payload.email,
        username: payload.username || payload.email.split("@")[0],
        isGuest: payload.isGuest,
      };
    }
  } catch (err) {
    console.error("Error decoding token:", err);
  }
  return null;
};

// Synchronously extract token from URL query or localStorage on initial mount
const getInitialToken = (): string | null => {
  let search = window.location.search;
  if (!search && window.location.href.includes("?")) {
    search = "?" + window.location.href.split("?")[1].split("#")[0];
  }

  const params = new URLSearchParams(search);
  const urlToken = params.get("token");
  const urlError = params.get("error");

  if (urlError) {
    toast.error("Google login failed. Please try again.");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (urlToken) {
    localStorage.setItem("token", urlToken);
    toast.success("Successfully logged in with Google!");
    window.history.replaceState({}, document.title, window.location.pathname);
    return urlToken;
  }

  return localStorage.getItem("token");
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getInitialToken());
  const [user, setUser] = useState<User | null>(() =>
    decodeUserFromToken(token),
  );
  const [loading, setLoading] = useState<boolean>(!user);

  // Load / refresh full user profile whenever token changes
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // If user was not pre-decoded from token, show loading spinner
      if (!user) {
        setLoading(true);
      }

      try {
        const u = await getMeApi();
        setUser(u);
      } catch (err) {
        console.error("Failed to load user session:", err);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const loginAsGuest = async (username?: string) => {
    try {
      const data = await guestLoginApi(username);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome, ${data.user.username}!`);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Guest login failed";
      toast.error(msg);
      throw err;
    }
  };

  const updateUsername = async (newUsername: string) => {
    try {
      const updatedUser = await updateProfileApi(newUsername);
      setUser(updatedUser);
      toast.success("Display name updated!");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update display name";
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn("Logout API cleanup warning:", err);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginAsGuest,
        updateUsername,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

