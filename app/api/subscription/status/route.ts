import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get active subscription for wallet
    const { data: subscription, error } = await supabase
      .from('developer_subscriptions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!subscription) {
      return NextResponse.json({
        hasActiveSubscription: false,
        subscription: null
      });
    }

    // Check if subscription is still valid
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    
    if (now > periodEnd) {
      return NextResponse.json({
        hasActiveSubscription: false,
        subscription: null
      });
    }

    return NextResponse.json({
      hasActiveSubscription: true,
      subscription: {
        id: subscription.id,
        planId: subscription.plan_id,
        billingPeriod: subscription.billing_period,
        status: subscription.status,
        uploadsRemaining: subscription.uploads_remaining,
        uploadsTotal: subscription.uploads_total,
        currentPeriodEnd: subscription.current_period_end,
        createdAt: subscription.created_at
      }
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}