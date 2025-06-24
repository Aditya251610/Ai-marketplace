export const RAZORPAY_PLANS = {
  starter: {
    weekly: { price: 699, uploads: 2, planId: 'plan_starter_weekly' },      // ₹699/week
    monthly: { price: 2299, uploads: 8, planId: 'plan_starter_monthly' },   // ₹2299/month
    quarterly: { price: 6299, uploads: 25, planId: 'plan_starter_quarterly' }, // ₹6299/3months
    yearly: { price: 23999, uploads: 100, planId: 'plan_starter_yearly' }   // ₹23999/year
  },
  professional: {
    weekly: { price: 1499, uploads: 5, planId: 'plan_pro_weekly' },         // ₹1499/week
    monthly: { price: 5499, uploads: 20, planId: 'plan_pro_monthly' },      // ₹5499/month
    quarterly: { price: 14999, uploads: 65, planId: 'plan_pro_quarterly' }, // ₹14999/3months
    yearly: { price: 55999, uploads: 260, planId: 'plan_pro_yearly' }       // ₹55999/year
  },
  enterprise: {
    weekly: { price: 3999, uploads: 15, planId: 'plan_enterprise_weekly' },    // ₹3999/week
    monthly: { price: 15999, uploads: 60, planId: 'plan_enterprise_monthly' }, // ₹15999/month
    quarterly: { price: 43999, uploads: 200, planId: 'plan_enterprise_quarterly' }, // ₹43999/3months
    yearly: { price: 159999, uploads: 800, planId: 'plan_enterprise_yearly' }  // ₹159999/year
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
      'Basic revenue sharing (90%)',
      'Standard model validation'
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
      'Custom model categories',
      'Priority support (24h response)',
      'Enhanced revenue sharing (92%)',
      'Model versioning & rollback',
      'Custom pricing for models',
      'Beta feature access'
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
      'Priority support (2h response)',
      'Maximum revenue sharing (95%)',
      'Advanced security features',
      'Custom compliance options',
      'Private model repositories',
      'Bulk upload tools',
      'Advanced team management',
      'Custom analytics & reporting',
      'SLA guarantees'
    ]
  }
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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

// Razorpay utility functions
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}