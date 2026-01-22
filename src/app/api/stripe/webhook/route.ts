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
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  // Vérifier que le webhook secret est configuré
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET manquant dans .env.local');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`📥 Webhook reçu: ${event.type} [${event.id}]`);
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

      // Événements non critiques - on les ignore mais on retourne 200
      case 'customer.created':
      case 'customer.updated':
      case 'payment_method.attached':
      case 'setup_intent.created':
      case 'setup_intent.succeeded':
      case 'invoice.created':
      case 'invoice.finalized':
      case 'invoice.paid':
        console.log(`ℹ️  Événement ignoré (non critique): ${event.type}`);
        return NextResponse.json({ received: true, ignored: true });

      default:
        console.log(`ℹ️  Événement non géré: ${event.type}`);
        return NextResponse.json({ received: true, unhandled: true });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`❌ Erreur traitement webhook [${event.type}]:`, err);
    console.error('Stack:', err.stack);
    return NextResponse.json(
      { error: `Webhook handler failed: ${err.message}`, type: event.type },
      { status: 500 }
    );
  }
}

// Gestion checkout session complétée (premier paiement)
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('❌ userId manquant dans session metadata');
    console.error('Session metadata:', JSON.stringify(session.metadata, null, 2));
    throw new Error('userId manquant dans session metadata');
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error('❌ subscriptionId manquant dans session');
    throw new Error('subscriptionId manquant dans session');
  }

  console.log(`📋 Récupération de l'abonnement: ${subscriptionId}`);
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
  const currentPeriodEnd = (subscription as any).current_period_end as number | undefined;
  const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end as boolean | undefined;

  console.log(`💾 Mise à jour du profil ${userId} avec le plan ${plan}`);

  try {
    await adminDb.collection('profiles').doc(userId).update({
      'subscription.plan': plan,
      'subscription.status': subscription.status,
      'subscription.stripeSubscriptionId': subscriptionId,
      'subscription.stripeCustomerId': subscription.customer as string,
      'subscription.currentPeriodEnd': currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      'subscription.cancelAtPeriodEnd': cancelAtPeriodEnd ?? false,
      updatedAt: new Date(),
    });
    console.log(`✅ Abonnement activé pour ${userId}: ${plan}`);
  } catch (error: any) {
    console.error(`❌ Erreur lors de la mise à jour du profil ${userId}:`, error);
    throw error;
  }
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

  const currentPeriodEnd = (subscription as any).current_period_end as number | undefined;
  const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end as boolean | undefined;

  await adminDb.collection('profiles').doc(userId).update({
    'subscription.plan': plan,
    'subscription.status': subscription.status,
    'subscription.currentPeriodEnd': currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000)
      : null,
    'subscription.cancelAtPeriodEnd': cancelAtPeriodEnd ?? false,
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
  const subscriptionId = (invoice as any).subscription as string | null | undefined;
  if (!subscriptionId) return;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const currentPeriodEnd = (subscription as any).current_period_end as number | undefined;

  await adminDb.collection('profiles').doc(userId).update({
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000)
      : null,
    updatedAt: new Date(),
  });

  console.log(`✅ Paiement réussi pour ${userId}`);
}

// Gestion échec paiement
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string | null | undefined;
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
