"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const HomeView = () => {
  const { data: session } = authClient.useSession();

  if (!session) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div className="flex flex-col p-4 gap-y-4">
      <p>Logged in as {session.user.name}</p>
      <button onClick={() => authClient.signOut()} className="bg-primary text-white px-4 py-2 rounded">Sign Out</button>
    </div>
  );
};

