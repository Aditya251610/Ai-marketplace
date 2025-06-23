import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get total waitlist count
    const { count: totalCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    // Get count by status
    const { data: statusData } = await supabase
      .from('waitlist')
      .select('status')
      .not('status', 'is', null);

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get top referral sources
    const { data: referralData } = await supabase
      .from('waitlist')
      .select('referral_source')
      .not('referral_source', 'is', null);

    // Process referral sources
    const referralCounts = referralData?.reduce((acc: Record<string, number>, item) => {
      const source = item.referral_source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {}) || {};

    // Process status counts
    const statusCounts = statusData?.reduce((acc: Record<string, number>, item) => {
      const status = item.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      total: totalCount || 0,
      recent: recentCount || 0,
      byStatus: statusCounts,
      topReferralSources: Object.entries(referralCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }))
    });

  } catch (error) {
    console.error('Failed to fetch waitlist stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist statistics' },
      { status: 500 }
    );
  }
}