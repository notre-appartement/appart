import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Instance Stripe côté client
 */
export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante dans .env.local');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
