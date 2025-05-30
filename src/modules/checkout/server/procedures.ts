import { z } from "zod";

import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { Media, Tenant } from "@/payload-types";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { CheckoutMetadata, ProductMetadata } from "../types";
import { stripe } from "@/lib/stripe";
import { PLATFORM_FEE_AMOUNT } from "@/constants";
import { generateTenantUrl } from "@/lib/utils";

export const checkoutRouter = createTRPCRouter({
  verify: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.findByID({
      collection: "users",
      id: ctx.session.user.id,
      depth: 0,
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const tenantId = user.tenants?.[0]?.tenant as string;
    const tenant = await ctx.db.findByID({
      collection: "tenants",
      id: tenantId,
    });

    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found",
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: tenant.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
      type: "account_onboarding",
    });

    if (!accountLink.url) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to create verification link",
      });
    }

    return { url: accountLink.url };
  }),
  purchase: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1),
        tenantSlug: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { productIds, tenantSlug } = input;

      const products = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.productIds,
              },
            },
            {
              "tenant.slug": {
                equals: tenantSlug,
              },
            },
            {
              isArchived: {
                not_equals: true,
              },
            },
          ],
        },
      });

      if (products.totalDocs !== productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }

      const [tenant] = (
        await ctx.db.find({
          collection: "tenants",
          limit: 1,
          pagination: false,
          where: {
            slug: {
              equals: tenantSlug,
            },
          },
        })
      )?.docs;

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      // TODO: Needs stripe connect
      // if (!tenant.stripeDetailsSubmitted) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "Tenant not allowed to sell products",
      //   });
      // }

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        products.docs.map((product) => ({
          quantity: 1,
          price_data: {
            unit_amount: product.price * 100,
            currency: "usd",
            product_data: {
              name: product.name,
              metadata: {
                stripeAccountId: tenant.stripeAccountId,
                id: product.id,
                name: product.name,
                price: product.price,
              } as ProductMetadata,
            },
          },
        }));

      const totalAmount = products.docs.reduce(
        (acc, item) => acc + item.price * 100,
        0
      );
      const platformFeePercent = Math.round(
        totalAmount * (PLATFORM_FEE_AMOUNT / 100)
      );

      const domain = generateTenantUrl(input.tenantSlug);

      const checkout = await stripe.checkout.sessions.create(
        {
          customer_email: ctx.session.user.email,
          success_url: `${domain}/checkout?success=true`,
          cancel_url: `${domain}/checkout?cancel=true`,
          mode: "payment",
          line_items: lineItems,
          invoice_creation: {
            enabled: true,
          },
          metadata: {
            userId: ctx.session.user.id,
          } as CheckoutMetadata,
          payment_intent_data: {
            application_fee_amount: platformFeePercent,
          },
        },
        {
          stripeAccount: tenant.stripeAccountId,
        }
      );

      if (!checkout.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }

      return {
        url: checkout.url,
      };
    }),
  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.find({
          collection: "products",
          depth: 2,
          where: {
            and: [
              {
                id: {
                  in: input.ids,
                },
                isArchive: {
                  not_equals: true,
                },
              },
            ],
          },
        });

        if (data.totalDocs !== input.ids.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Some products were not found",
          });
        }

        const totalPrice = data.docs.reduce((acc, doc) => {
          const price = doc.price as number;
          return acc + (isNaN(price) ? 0 : price);
        }, 0);

        return {
          ...data,
          totalPrice,
          docs: data.docs.map((doc) => ({
            ...doc,
            image: doc.image as Media | null,
            tenant: doc.tenant as Tenant & { image: Media | null },
          })),
        };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Some products were not found",
        });
      }
    }),
});
