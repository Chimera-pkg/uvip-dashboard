import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { message } from "antd";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string; role: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DUMMY_USER = {
  email: "admin@uvip.id",
  password: "admin123",
  name: "Herry Santosa",
  role: "Super Admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const login = (email: string, password: string): boolean => {
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      setIsAuthenticated(true);
      setUser({ name: DUMMY_USER.name, email: DUMMY_USER.email, role: DUMMY_USER.role });
      message.success("Login berhasil! Selamat datang.");
      return true;
    }
    message.error("Email atau password salah.");
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    message.info("Anda telah logout.");
  };

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
