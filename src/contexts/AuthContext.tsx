import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { auth } from "../firebase/firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";

export type UserRole = "seeker" | "owner" | "admin";

export type User = {
  id: number | string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  occupation?: string;
  collegeOrCompany?: string;
  budget?: number;
  savedProperties?: number[];
  listedProperties?: number[];
  bookingRequests?: any[];
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string, role?: UserRole) => boolean;
  loginAsDemo: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string, role?: UserRole, occupation?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_SEEKER: User = {
  id: 1,
  name: "Rahul Verma",
  email: "rahul.seeker@example.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  role: "seeker",
  phone: "+91 98765 43210",
  occupation: "Working Professional (Software Engineer)",
  collegeOrCompany: "Swiggy Tech, Bengaluru",
  budget: 18000,
  savedProperties: [1, 2, 7]
};

const DEMO_OWNER: User = {
  id: 2,
  name: "Priya Sharma",
  email: "priya.owner@example.com",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  role: "owner",
  phone: "+91 98234 56789",
  occupation: "Property Manager & PG Operator",
  collegeOrCompany: "Stanza Living & Urban PGs",
  listedProperties: [1, 2, 4, 6, 7]
};

const DEMO_ADMIN: User = {
  id: 3,
  name: "Platform Administrator",
  email: "admin@rentright.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  role: "admin",
  phone: "+91 90000 00001",
  occupation: "RentRight Quality & Trust Head"
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("rentright_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Error reading stored user", e);
      }
    }
    // No stored session => visitor is anonymous. Public browsing stays
    // available; protected routes (dashboard / owner portal) require an
    // explicit sign-in via the RBAC guard.
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Authenticated only when a real session has been persisted.
    return !!localStorage.getItem("rentright_user");
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("rentright_user", JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("rentright_user");
      setIsAuthenticated(false);
    }
  }, [user]);

  // Demo Login Quick Switch
  const loginAsDemo = (role: UserRole) => {
    let demoUser: User;
    if (role === "owner") demoUser = DEMO_OWNER;
    else if (role === "admin") demoUser = DEMO_ADMIN;
    else demoUser = DEMO_SEEKER;

    setUser(demoUser);
    setIsAuthenticated(true);
    toast.success(`Logged in as ${demoUser.name} (${role.toUpperCase()})`);
  };

  const login = (email: string, password?: string, role: UserRole = "seeker"): boolean => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.includes("owner") || cleanEmail.includes("jane") || role === "owner") {
      setUser({ ...DEMO_OWNER, email: cleanEmail });
    } else if (cleanEmail.includes("admin") || role === "admin") {
      setUser({ ...DEMO_ADMIN, email: cleanEmail });
    } else {
      setUser({ ...DEMO_SEEKER, email: cleanEmail, name: email.split("@")[0] });
    }
    setIsAuthenticated(true);
    toast.success("Signed in successfully!");
    return true;
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    toast.info(`Switched role to ${newRole.toUpperCase()}`);
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        const userData: User = {
          id: res.user.uid,
          name: res.user.displayName || "Google User",
          email: res.user.email || "",
          avatar: res.user.photoURL || DEMO_SEEKER.avatar,
          role: "seeker",
          occupation: "Student / Professional"
        };
        setUser(userData);
        setIsAuthenticated(true);
        toast.success(`Welcome ${userData.name}!`);
      }
    } catch (error: any) {
      console.warn("Google popup failed, falling back to local demo auth:", error.message);
      // Fallback for dev / unconfigured Firebase API key
      loginAsDemo("seeker");
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      login(email, password);
    } catch (error: any) {
      console.warn("Firebase signin error, using local authentication:", error.message);
      login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = "seeker",
    occupation: string = "Student"
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch (error: any) {
      console.warn("Firebase signup error, proceeding with local registration:", error.message);
    } finally {
      const newUser: User = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        email,
        avatar: role === "owner" ? DEMO_OWNER.avatar : DEMO_SEEKER.avatar,
        role,
        occupation,
        savedProperties: [],
        listedProperties: role === "owner" ? [] : undefined
      };
      setUser(newUser);
      setIsAuthenticated(true);
      toast.success(`Account created as ${role.toUpperCase()}! Welcome to RentRight, ${name}!`);
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error: any) {
      console.log("Firebase logout notice:", error?.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("rentright_user");
      toast.info("Logged out safely");
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        loginAsDemo,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
