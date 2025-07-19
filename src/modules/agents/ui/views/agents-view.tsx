"use client";

import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loadung-state"; // تصحيح الاسم
import { Errorstate } from "@/components/error-state"; // تصحيح الاسم
import { ResponsiveDialog } from "@/components/responsive-dialog";

const AgentsInner = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  return (
    <div>
      
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const AgentsView = () => {
  return (
    <Suspense fallback={<AgentsViewLoading />}>
      <AgentsInner />
    </Suspense>
  );
};

export const AgentsViewLoading = () => {
  return (
    <LoadingState
      title="Loading Agents"
      description="This may take a few seconds"
    />
  );
};
export const AgentsViewError = () => {
  return (
    <Errorstate
            title="Error Loading Agents"
            description="Something Went Wrong"
        />
  )
}