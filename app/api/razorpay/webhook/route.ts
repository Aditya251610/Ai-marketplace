import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const crypto = require('crypto');

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature')!;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.event}`);
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

async function handlePaymentCaptured(payment: any) {
  try {
    console.log('Payment captured:', payment.id);
    
    // Update subscription status if needed
    await supabase
      .from('developer_subscriptions')
      .update({
        status: 'active',
        last_payment_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_payment_id', payment.id);

  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    console.log('Payment failed:', payment.id);
    
    // Update subscription status
    await supabase
      .from('developer_subscriptions')
      .update({
        status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_payment_id', payment.id);

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleSubscriptionCharged(subscription: any) {
  try {
    console.log('Subscription charged:', subscription.id);
    // Handle recurring subscription charges
  } catch (error) {
    console.error('Error handling subscription charged:', error);
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    console.log('Subscription cancelled:', subscription.id);
    
    // Update subscription status
    await supabase
      .from('developer_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_subscription_id', subscription.id);

  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
}