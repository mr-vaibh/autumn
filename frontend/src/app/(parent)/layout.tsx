"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    ["/parent/sessions", "/parent/progress", "/parent/fees", "/parent/communication"]
      .forEach((p) => router.prefetch(p));
  }, [router]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user && user.role !== "PARENT") {
      if (user.role === "ADMIN") router.replace("/admin");
      else router.replace("/teacher");
    }
  }, [user, loading, router]);

  if (loading) return <PageLoader />;
  if (!user || user.role !== "PARENT") return null;

  return (
    <>
      <NavigationProgress />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
