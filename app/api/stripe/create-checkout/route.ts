import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const {
      priceId,
      planId,
      billingPeriod,
      walletAddress,
      successUrl,
      cancelUrl
    } = await request.json();

    // Validate required fields
    if (!priceId || !planId || !billingPeriod || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId,
        billingPeriod,
        walletAddress,
      },
      customer_email: undefined, // Let user enter email
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          planId,
          billingPeriod,
          walletAddress,
        },
      },
    });

    // Store the session info in our database for tracking
    try {
      await supabase.from('subscription_sessions').insert({
        session_id: session.id,
        wallet_address: walletAddress,
        plan_id: planId,
        billing_period: billingPeriod,
        price_id: priceId,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Failed to store session in database:', dbError);
      // Don't fail the request if database storage fails
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}