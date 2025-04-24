"use client";

import { useTRPC } from "@/trcp/client";
import { useQuery } from "@tanstack/react-query";

const HomePage = () => {
  const trcp = useTRPC();

  const { data } = useQuery(trcp.auth.session.queryOptions());

  return <div>{JSON.stringify(data?.user, null, 2)}</div>;
};

export default HomePage;
