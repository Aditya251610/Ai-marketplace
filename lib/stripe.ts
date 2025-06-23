import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const STRIPE_PRICE_IDS = {
  starter: {
    weekly: 'price_starter_weekly',
    monthly: 'price_starter_monthly',
    quarterly: 'price_starter_quarterly',
    yearly: 'price_starter_yearly'
  },
  professional: {
    weekly: 'price_pro_weekly',
    monthly: 'price_pro_monthly',
    quarterly: 'price_pro_quarterly',
    yearly: 'price_pro_yearly'
  },
  enterprise: {
    weekly: 'price_enterprise_weekly',
    monthly: 'price_enterprise_monthly',
    quarterly: 'price_enterprise_quarterly',
    yearly: 'price_enterprise_yearly'
  }
};

export const PLAN_FEATURES = {
  starter: {
    name: 'Starter',
    description: 'Perfect for individual developers',
    features: [
      'Upload AI agents to marketplace',
      'Basic model hosting on IPFS',
      'Standard performance analytics',
      'Community support',
      'Basic revenue sharing (90%)'
    ]
  },
  professional: {
    name: 'Professional',
    description: 'For serious developers and small teams',
    features: [
      'Everything in Starter',
      'Priority model processing',
      'Advanced analytics dashboard',
      'A/B testing for models',
      'Priority support (24h response)',
      'Enhanced revenue sharing (92%)'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large teams and organizations',
    features: [
      'Everything in Professional',
      'Unlimited model hosting',
      'White-label solutions',
      'Dedicated account manager',
      'Custom integrations & APIs',
      'Maximum revenue sharing (95%)'
    ]
  }
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getPlanUploadLimits(planId: string, billingPeriod: string): number {
  const limits = {
    starter: {
      weekly: 2,
      monthly: 8,
      quarterly: 25,
      yearly: 100
    },
    professional: {
      weekly: 5,
      monthly: 20,
      quarterly: 65,
      yearly: 260
    },
    enterprise: {
      weekly: 15,
      monthly: 60,
      quarterly: 200,
      yearly: 800
    }
  };

  return limits[planId as keyof typeof limits]?.[billingPeriod as keyof typeof limits.starter] || 0;
}