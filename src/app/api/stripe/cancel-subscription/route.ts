import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId manquant' },
        { status: 400 }
      );
    }

    // Récupérer le profil utilisateur pour obtenir l'ID de l'abonnement Stripe
    const profileDoc = await adminDb.collection('profiles').doc(userId).get();

    if (!profileDoc.exists) {
      return NextResponse.json(
        { error: 'Profil utilisateur introuvable' },
        { status: 404 }
      );
    }

    const profileData = profileDoc.data();
    const stripeSubscriptionId = profileData?.subscription?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé' },
        { status: 400 }
      );
    }

    // Annuler l'abonnement Stripe (immédiatement)
    await stripe.subscriptions.cancel(stripeSubscriptionId);

    // Mettre à jour le profil utilisateur
    await adminDb.collection('profiles').doc(userId).update({
      'subscription.plan': 'free',
      'subscription.status': 'canceled',
      'subscription.cancelAtPeriodEnd': false,
      updatedAt: new Date(),
    });

    console.log(`✅ Abonnement annulé immédiatement pour ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'annulation de l\'abonnement' },
      { status: 500 }
    );
  }
}
