import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const { planId, billingPeriod, walletAddress } = session.metadata || {};
    
    if (!planId || !billingPeriod || !walletAddress) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Update session status
    await supabase
      .from('subscription_sessions')
      .update({ 
        status: 'completed',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string
      })
      .eq('session_id', session.id);

    console.log('Checkout completed for session:', session.id);

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const { planId, billingPeriod, walletAddress } = subscription.metadata || {};
    
    if (!planId || !billingPeriod || !walletAddress) {
      console.error('Missing metadata in subscription:', subscription.id);
      return;
    }

    // Get plan details
    const planDetails = getPlanDetails(planId, billingPeriod as any);
    
    // Create subscription record
    await supabase.from('developer_subscriptions').insert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      wallet_address: walletAddress,
      plan_id: planId,
      billing_period: billingPeriod,
      status: subscription.status,
      uploads_remaining: planDetails.uploads,
      uploads_total: planDetails.uploads,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString()
    });

    console.log('Subscription created:', subscription.id);

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Update subscription record
    await supabase
      .from('developer_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log('Subscription updated:', subscription.id);

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Update subscription status to cancelled
    await supabase
      .from('developer_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log('Subscription cancelled:', subscription.id);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription) {
      // Reset upload quota for new billing period
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const { planId, billingPeriod } = subscription.metadata || {};
      
      if (planId && billingPeriod) {
        const planDetails = getPlanDetails(planId, billingPeriod as any);
        
        await supabase
          .from('developer_subscriptions')
          .update({
            uploads_remaining: planDetails.uploads,
            uploads_total: planDetails.uploads,
            last_payment_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
      }
    }

    console.log('Payment succeeded for invoice:', invoice.id);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    // Handle failed payment - maybe send notification email
    console.log('Payment failed for invoice:', invoice.id);

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

function getPlanDetails(planId: string, billingPeriod: 'weekly' | 'monthly' | 'quarterly' | 'yearly') {
  const plans = {
    starter: {
      weekly: { uploads: 2 },
      monthly: { uploads: 8 },
      quarterly: { uploads: 25 },
      yearly: { uploads: 100 }
    },
    professional: {
      weekly: { uploads: 5 },
      monthly: { uploads: 20 },
      quarterly: { uploads: 65 },
      yearly: { uploads: 260 }
    },
    enterprise: {
      weekly: { uploads: 15 },
      monthly: { uploads: 60 },
      quarterly: { uploads: 200 },
      yearly: { uploads: 800 }
    }
  };

  return plans[planId as keyof typeof plans]?.[billingPeriod] || { uploads: 0 };
}