"use client";

import { useTRPC } from "@/trpc/client";
import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { DEFAULT_BG_COLOR } from "@/modules/home/constants";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { useProductFilter } from "@/modules/products/hooks/use-product-filter";

export const SearchFilters = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  const [filters, setFilters] = useProductFilter();

  const params = useParams();
  const { category, subcategory } = params;
  const activeCategory = (category as string) ?? "all";

  const activeCategoryData = data.find((c) => c.slug === activeCategory);

  const activeCategoryColor = activeCategoryData?.color ?? DEFAULT_BG_COLOR;
  const activeCategoryName = activeCategoryData?.name ?? "all";

  const activeSubcategory = subcategory as string | undefined;
  const activeSubcategoryName = activeCategoryData?.subcategories?.find(
    (s) => s.slug === activeSubcategory
  )?.name;

  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{
        backgroundColor: activeCategoryColor,
      }}
    >
      <SearchInput
        defaultValue={filters.search}
        onChange={(value) => setFilters({ search: value })}
      />
      <div className="hidden lg:block">
        <Categories data={data} />
      </div>
      <BreadcrumbNavigation
        activeCategoryName={activeCategoryName}
        activeCategory={activeCategory}
        activeSubcategoryName={activeSubcategoryName}
      />
    </div>
  );
};

export const SearchFiltersLoading = () => {
  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <SearchInput disabled defaultValue="" onChange={() => {}} />
      <div className="hidden lg:block">
        <div className="h-11" />
      </div>
    </div>
  );
};
