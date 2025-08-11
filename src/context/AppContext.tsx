import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export type ProjectType = "Website" | "App" | "Service Flow" | "Other";

export interface UserProfile {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  interests?: string[] | null;
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
  user?: UserProfile;
  credits: number;
  tests: TestRequest[];
  feedbacks: Feedback[];
  logout: () => Promise<void>;
  postTest: (input: Omit<TestRequest, "id" | "ownerId" | "createdAt" | "status">) => Promise<TestRequest | null>;
  submitFeedback: (testId: string, content: string, rating?: number) => Promise<Feedback | null>;
  approveFeedback: (feedbackId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | undefined>();
  const [credits, setCredits] = useState<number>(0);
  const [tests, setTests] = useState<TestRequest[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const mapTest = (r: any): TestRequest => ({
    id: r.id,
    title: r.title,
    type: r.type,
    goals: r.goals ?? "",
    timeRequired: r.time_required as 5 | 10 | 15 | 30,
    reward: r.reward,
    link: r.link,
    nda: r.nda,
    ownerId: r.owner_id,
    createdAt: r.created_at,
    status: r.status,
  });

  const mapFeedback = (r: any): Feedback => ({
    id: r.id,
    testId: r.test_id,
    testerId: r.tester_id,
    content: r.content,
    rating: r.rating ?? undefined,
    status: r.status,
    createdAt: r.created_at,
  });

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("id, display_name, avatar_url, bio, skills, interests, credits_balance").eq("id", uid).maybeSingle();
    if (data) {
      setUser({ id: data.id, name: data.display_name, avatarUrl: data.avatar_url, bio: data.bio, skills: data.skills, interests: data.interests });
      setCredits(data.credits_balance ?? 0);
    } else {
      setUser(undefined);
      setCredits(0);
    }
  };

  const fetchTests = async () => {
    const { data, error } = await supabase.from("test_requests").select("*").order("created_at", { ascending: false });
    if (!error && data) setTests(data.map(mapTest));
  };

  const fetchMyFeedbacks = async (uid?: string) => {
    if (!uid) { setFeedbacks([]); return; }
    const { data, error } = await supabase.from("submissions").select("*").eq("tester_id", uid).order("created_at", { ascending: false });
    if (!error && data) setFeedbacks(data.map(mapFeedback));
  };

  useEffect(() => {
    const init = async () => {
      // Set up listener first
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
        const uid = session?.user?.id;
        if (uid) {
          setTimeout(() => { fetchProfile(uid); fetchMyFeedbacks(uid); }, 0);
        } else {
          setUser(undefined);
          setCredits(0);
          setFeedbacks([]);
        }
      });
      // Then get current session
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user?.id;
      if (uid) {
        await fetchProfile(uid);
        await fetchMyFeedbacks(uid);
      }
      await fetchTests();
      return () => subscription.unsubscribe();
    };
    init();

    // Realtime for tests (optional)
    const channel = supabase
      .channel('public:test_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'test_requests' }, () => {
        fetchTests();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    toast("Signed out");
  };

  const postTest: AppContextValue["postTest"] = async (input) => {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user?.id;
    if (!uid) { toast.error("Please sign in to post a test"); return null; }

    const insert = {
      title: input.title,
      type: input.type,
      goals: input.goals,
      time_required: input.timeRequired,
      reward: input.reward,
      link: input.link,
      nda: !!input.nda,
      owner_id: uid,
      max_testers: 1,
    };

    const { data, error } = await supabase.from("test_requests").insert(insert).select("*").maybeSingle();
    if (error || !data) {
      toast.error(error?.message || "Failed to post test");
      return null;
    }
    const t = mapTest(data);
    setTests((arr) => [t, ...arr]);
    toast.success("Test posted");
    return t;
  };

  const submitFeedback: AppContextValue["submitFeedback"] = async (testId, content, rating) => {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user?.id;
    if (!uid) { toast.error("Please sign in to submit feedback"); return null; }

    const { data, error } = await supabase.from("submissions").insert({
      test_id: testId,
      tester_id: uid,
      content,
      rating: rating ?? null,
    }).select("*").maybeSingle();

    if (error || !data) {
      toast.error(error?.message || "Submission failed");
      return null;
    }
    const fb = mapFeedback(data);
    setFeedbacks((arr) => [fb, ...arr]);
    toast.success("Feedback submitted");
    return fb;
  };

  const approveFeedback: AppContextValue["approveFeedback"] = async (feedbackId) => {
    const { error } = await supabase.from("submissions").update({ status: 'approved' }).eq('id', feedbackId);
    if (error) toast.error(error.message); else toast.success("Feedback approved");
  };

  const refreshProfile = async () => {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user?.id;
    if (uid) await fetchProfile(uid);
  };

  const value = useMemo(() => ({
    user, credits, tests, feedbacks, logout, postTest, submitFeedback, approveFeedback, refreshProfile,
  }), [user, credits, tests, feedbacks]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
