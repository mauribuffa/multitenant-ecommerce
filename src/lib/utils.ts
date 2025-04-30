import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateTenantUrl = (slug: string) => {
  // In development mode, use normal routing
  if (process.env.NODE_ENV === "development")
    return `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${slug}`;

  const protocol = "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  // In production, use subdomain routing
  return `${protocol}://${slug}.${domain}`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
