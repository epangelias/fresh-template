import { FreshContext, HttpError } from 'fresh';
import { STATUS_CODE } from '@std/http/status';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || 'X';

export function isStripeEnabled() {
  return Deno.env.has('STRIPE_SECRET_KEY');
}

export function getStripePremiumPlanPriceId() {
  return Deno.env.get(
    'STRIPE_PREMIUM_PLAN_PRICE_ID',
  );
}

export const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

export async function HandleStripeWebhook(ctx: FreshContext) {
  if (!isStripeEnabled()) throw new HttpError(STATUS_CODE.NotFound);

  const body = await ctx.req.text();
  const signature = ctx.req.headers.get('stripe-signature');
  if (signature === null) {
    throw new HttpError(STATUS_CODE.BadRequest, '`Stripe-Signature` header is missing');
  }
  const signingSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (signingSecret === undefined) {
    throw new Error(
      '`STRIPE_WEBHOOK_SECRET` environment variable is not set',
    );
  }

  try {
    return await stripe.webhooks.constructEventAsync(
      body,
      signature,
      signingSecret,
      undefined,
      cryptoProvider,
    ) as Stripe.Event & { data: { object: { customer: string } } };
  } catch (error) {
    throw new HttpError(STATUS_CODE.NotFound, error.message);
  }
}