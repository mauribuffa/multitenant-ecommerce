import { ClientUser } from "payload";
import type { User } from "@/payload-types";

export const isSuperAdmin = (user: User | ClientUser | null) => {
  return user?.roles?.includes("super-admin");
};
