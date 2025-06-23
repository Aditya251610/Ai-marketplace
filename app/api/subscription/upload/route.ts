import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, agentId } = await request.json();

    if (!walletAddress || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('developer_subscriptions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 403 }
      );
    }

    // Check if subscription is still valid
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    
    if (now > periodEnd) {
      return NextResponse.json(
        { error: 'Subscription has expired' },
        { status: 403 }
      );
    }

    // Check if user has uploads remaining
    if (subscription.uploads_remaining <= 0) {
      return NextResponse.json(
        { error: 'No uploads remaining in current period' },
        { status: 403 }
      );
    }

    // Decrement upload count
    const { error: updateError } = await supabase
      .from('developer_subscriptions')
      .update({
        uploads_remaining: subscription.uploads_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw updateError;
    }

    // Record the upload
    await supabase.from('subscription_uploads').insert({
      subscription_id: subscription.id,
      agent_id: agentId,
      wallet_address: walletAddress,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      uploadsRemaining: subscription.uploads_remaining - 1,
      message: 'Upload quota decremented successfully'
    });

  } catch (error) {
    console.error('Upload tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track upload' },
      { status: 500 }
    );
  }
}