import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/trpc/routers/_app";

export type AgentGetOne = inferRouterOutputs<typeof appRouter>["agents"]["getOne"];