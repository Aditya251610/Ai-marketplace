import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RAZORPAY_PLANS } from '@/lib/razorpay';

const crypto = require('crypto');

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billingPeriod,
      walletAddress
    } = await request.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get plan details
    const planDetails = RAZORPAY_PLANS[planId as keyof typeof RAZORPAY_PLANS]?.[billingPeriod as keyof typeof RAZORPAY_PLANS.starter];
    
    if (!planDetails) {
      return NextResponse.json(
        { error: 'Invalid plan details' },
        { status: 400 }
      );
    }

    // Calculate subscription period
    const now = new Date();
    let periodEnd = new Date(now);
    
    switch (billingPeriod) {
      case 'weekly':
        periodEnd.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        periodEnd.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        periodEnd.setMonth(now.getMonth() + 3);
        break;
      case 'yearly':
        periodEnd.setFullYear(now.getFullYear() + 1);
        break;
    }

    // Update session status
    await supabase
      .from('subscription_sessions')
      .update({ 
        status: 'completed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id
      })
      .eq('session_id', razorpay_order_id);

    // Create or update subscription record
    const { data: existingSubscription } = await supabase
      .from('developer_subscriptions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      // Update existing subscription
      await supabase
        .from('developer_subscriptions')
        .update({
          plan_id: planId,
          billing_period: billingPeriod,
          uploads_remaining: planDetails.uploads,
          uploads_total: planDetails.uploads,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          last_payment_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', existingSubscription.id);
    } else {
      // Create new subscription
      await supabase.from('developer_subscriptions').insert({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        wallet_address: walletAddress,
        plan_id: planId,
        billing_period: billingPeriod,
        status: 'active',
        uploads_remaining: planDetails.uploads,
        uploads_total: planDetails.uploads,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        last_payment_at: now.toISOString(),
        created_at: now.toISOString()
      });
    }

    console.log('Payment verified and subscription created:', razorpay_payment_id);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}