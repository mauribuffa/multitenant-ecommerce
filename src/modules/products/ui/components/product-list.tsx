"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

interface Props {
  category: string;
}

export const ProductList = ({ category }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({
      category: category,
    })
  );

  return <div>{JSON.stringify(data)}</div>;
};

export const ProductListSkeleton = () => {
  return <div>Loading...</div>;
};
