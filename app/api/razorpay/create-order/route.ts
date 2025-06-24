import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const {
      planId,
      billingPeriod,
      amount,
      walletAddress,
      userEmail,
      userName
    } = await request.json();

    // Validate required fields
    if (!planId || !billingPeriod || !amount || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId,
        billingPeriod,
        walletAddress,
        userEmail: userEmail || '',
        userName: userName || ''
      }
    });

    // Store the order info in our database for tracking
    try {
      await supabase.from('subscription_sessions').insert({
        session_id: order.id,
        wallet_address: walletAddress,
        plan_id: planId,
        billing_period: billingPeriod,
        price_id: `${planId}_${billingPeriod}`,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Failed to store order in database:', dbError);
      // Don't fail the request if database storage fails
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}