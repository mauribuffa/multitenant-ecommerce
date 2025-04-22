import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trcp/routers/_app";

export type CategoriesGetManyOutput =
  inferRouterOutputs<AppRouter>["categories"]["getMany"];
export type CategoriesGetManyOutputSingle = CategoriesGetManyOutput[number];
