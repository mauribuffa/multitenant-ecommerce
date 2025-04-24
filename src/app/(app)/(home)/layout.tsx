import { getQueryClient, trpc } from "@/trpc/server";

import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { SearchFilters, SearchFiltersLoading } from "./search-filters";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

const HomeLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SearchFiltersLoading />}>
          <SearchFilters />
        </Suspense>
      </HydrationBoundary>
      <div className="flex-1 bg-[#F4F4F0]">{children}</div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
