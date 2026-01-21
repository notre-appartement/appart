import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Créer une session Checkout Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/abonnement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/abonnement?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
        trial_period_days: 14, // 14 jours d'essai gratuit
      },
    });

    // Retourner l'URL de checkout au lieu du sessionId
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Erreur création session Stripe:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
