import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Gérer les événements Stripe
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Erreur traitement webhook:`, err);
    return NextResponse.json(
      { error: `Webhook handler failed: ${err.message}` },
      { status: 500 }
    );
  }
}

// Gestion checkout session complétée (premier paiement)
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('userId manquant dans session metadata');
    return;
  }

  const subscriptionId = session.subscription as string;
  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Déterminer le plan en fonction du price ID
  const priceId = subscription.items.data[0]?.price.id;
  let plan: 'free' | 'premium' | 'pro' = 'free';

  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY) {
    plan = 'premium';
  } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY) {
    plan = 'pro';
  }

  // Mettre à jour le profil utilisateur dans Firestore
  await adminDb.collection('profiles').doc(userId).update({
    'subscription.plan': plan,
    'subscription.status': subscription.status,
    'subscription.stripeSubscriptionId': subscriptionId,
    'subscription.stripeCustomerId': subscription.customer as string,
    'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
    updatedAt: new Date(),
  });

  console.log(`✅ Abonnement activé pour ${userId}: ${plan}`);
}

// Gestion mise à jour abonnement
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price.id;
  let plan: 'free' | 'premium' | 'pro' = 'free';

  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY) {
    plan = 'premium';
  } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY) {
    plan = 'pro';
  }

  await adminDb.collection('profiles').doc(userId).update({
    'subscription.plan': plan,
    'subscription.status': subscription.status,
    'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
    updatedAt: new Date(),
  });

  console.log(`✅ Abonnement mis à jour pour ${userId}: ${plan}`);
}

// Gestion suppression/annulation abonnement
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await adminDb.collection('profiles').doc(userId).update({
    'subscription.plan': 'free',
    'subscription.status': 'canceled',
    'subscription.cancelAtPeriodEnd': false,
    updatedAt: new Date(),
  });

  console.log(`✅ Abonnement annulé pour ${userId}`);
}

// Gestion paiement réussi
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await adminDb.collection('profiles').doc(userId).update({
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    updatedAt: new Date(),
  });

  console.log(`✅ Paiement réussi pour ${userId}`);
}

// Gestion échec paiement
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await adminDb.collection('profiles').doc(userId).update({
    'subscription.status': 'past_due',
    updatedAt: new Date(),
  });

  console.log(`⚠️ Échec paiement pour ${userId}`);
}
