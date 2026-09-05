import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { message } from "antd";
import { authService, type User } from "../api/auth.service";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (_email: string, _password: string): Promise<boolean> => {
    // Dummy bypass for UI preview (remove before production)
    const mockUser: User = {
      id: "1",
      email: _email || "admin@uvip.id",
      full_name: "Herry Santosa",
      role: "Super Admin",
      is_active: true,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("access_token", "dummy-token-for-preview");
    localStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      message.info("Anda telah logout.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
