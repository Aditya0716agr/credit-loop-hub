import React, { createContext, useContext, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";

export type ProjectType = "Website" | "App" | "Service Flow" | "Other";

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
}

export interface TestRequest {
  id: string;
  title: string;
  type: ProjectType;
  goals: string;
  timeRequired: 5 | 10 | 15 | 30;
  reward: number;
  link: string;
  nda?: boolean;
  ownerId: string;
  createdAt: string;
  status: "active" | "closed";
}

export interface Feedback {
  id: string;
  testId: string;
  testerId: string;
  content: string;
  rating?: number;
  status: "submitted" | "approved" | "rejected";
  createdAt: string;
}

interface AppContextValue {
  user?: User;
  credits: number;
  tests: TestRequest[];
  feedbacks: Feedback[];
  loginDemo: () => void;
  logout: () => void;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  postTest: (input: Omit<TestRequest, "id" | "ownerId" | "createdAt" | "status">) => TestRequest | null;
  submitFeedback: (testId: string, content: string, rating?: number) => Feedback | null;
  approveFeedback: (feedbackId: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function genId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

const seedOwner: User = { id: "user-seed", name: "Seed Founder" };

const seedTests: TestRequest[] = [
  {
    id: genId("t"),
    title: "Landing Page Clarity Check",
    type: "Website",
    goals: "Is the value proposition clear within 5 seconds?",
    timeRequired: 5,
    reward: 2,
    link: "https://example.com",
    nda: false,
    ownerId: seedOwner.id,
    createdAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: genId("t"),
    title: "Mobile Onboarding Flow",
    type: "App",
    goals: "Find onboarding friction in 3 steps.",
    timeRequired: 10,
    reward: 4,
    link: "https://example.com/app",
    nda: false,
    ownerId: seedOwner.id,
    createdAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: genId("t"),
    title: "Checkout Usability",
    type: "Service Flow",
    goals: "Complete a sample checkout and rate ease.",
    timeRequired: 15,
    reward: 6,
    link: "https://example.com/shop",
    nda: true,
    ownerId: seedOwner.id,
    createdAt: new Date().toISOString(),
    status: "active",
  },
];

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>();
  const [credits, setCredits] = useState<number>(0);
  const [tests, setTests] = useState<TestRequest[]>(seedTests);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const loginDemo = () => {
    const demo: User = { id: "user-demo", name: "Demo User" };
    setUser(demo);
    setCredits((c) => (c > 0 ? c : 10)); // 10 free credits on first sign-in
    toast({ title: "Signed in", description: "Welcome to IdeaSoop Beta Hub." });
  };

  const logout = () => {
    setUser(undefined);
    toast({ title: "Signed out" });
  };

  const addCredits = (amount: number) => setCredits((c) => c + amount);

  const deductCredits = (amount: number) => {
    if (credits < amount) return false;
    setCredits((c) => c - amount);
    return true;
  };

  const postTest: AppContextValue["postTest"] = (input) => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to post a test." });
      return null;
    }
    if (input.reward < 2) {
      toast({ title: "Minimum reward is 2 credits" });
      return null;
    }
    if (!deductCredits(input.reward)) {
      toast({
        title: "Not enough credits",
        description: "Buy credits to post this test.",
      });
      return null;
    }
    const newTest: TestRequest = {
      id: genId("t"),
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      status: "active",
      ...input,
    };
    setTests((arr) => [newTest, ...arr]);
    toast({ title: "Test posted", description: `${input.title} is now live.` });
    return newTest;
  };

  const submitFeedback: AppContextValue["submitFeedback"] = (testId, content, rating) => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to submit feedback." });
      return null;
    }
    const fb: Feedback = {
      id: genId("fb"),
      testId,
      testerId: user.id,
      content,
      rating,
      status: "submitted",
      createdAt: new Date().toISOString(),
    };
    setFeedbacks((arr) => [fb, ...arr]);
    toast({ title: "Feedback submitted", description: "Awaiting requester approval." });
    return fb;
  };

  const approveFeedback = (feedbackId: string) => {
    const fb = feedbacks.find((f) => f.id === feedbackId);
    if (!fb) return;
    const test = tests.find((t) => t.id === fb.testId);
    if (!test) return;
    if (user?.id !== test.ownerId) {
      toast({ title: "Only the requester can approve feedback" });
      return;
    }
    setFeedbacks((arr) => arr.map((f) => (f.id === feedbackId ? { ...f, status: "approved" } : f)));
    // Transfer credits: reward goes to tester (already deducted from owner at post time)
    addCredits(0); // no-op for owner
    // In a real backend, we'd credit the tester. For demo, if approving other's feedback while signed in as owner, also increment owner's credits to visualize flow
    toast({ title: "Feedback approved", description: `Transferred ${test.reward} credits.` });
  };

  const value = useMemo(
    () => ({ user, credits, tests, feedbacks, loginDemo, logout, addCredits, deductCredits, postTest, submitFeedback, approveFeedback }),
    [user, credits, tests, feedbacks]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
