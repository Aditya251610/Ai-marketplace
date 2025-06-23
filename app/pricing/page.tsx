'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  Zap, 
  Upload, 
  Crown, 
  Rocket,
  Star,
  Users,
  Shield,
  Headphones,
  Code,
  Database,
  Globe,
  TrendingUp,
  Clock,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import { useAccount } from 'wagmi';

type PricingPlan = {
  id: string;
  name: string;
  description: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  pricing: {
    weekly: { price: number; uploads: number; priceId: string };
    monthly: { price: number; uploads: number; priceId: string };
    quarterly: { price: number; uploads: number; priceId: string };
    yearly: { price: number; uploads: number; priceId: string };
  };
  features: string[];
  limitations?: string[];
  popular?: boolean;
  enterprise?: boolean;
};

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual developers getting started',
    icon: Code,
    pricing: {
      weekly: { price: 9, uploads: 2, priceId: 'price_starter_weekly' },
      monthly: { price: 29, uploads: 8, priceId: 'price_starter_monthly' },
      quarterly: { price: 79, uploads: 25, priceId: 'price_starter_quarterly' },
      yearly: { price: 299, uploads: 100, priceId: 'price_starter_yearly' }
    },
    features: [
      'Upload AI agents to marketplace',
      'Basic model hosting on IPFS',
      'Standard performance analytics',
      'Community support',
      'Basic revenue sharing (90%)',
      'Standard model validation'
    ],
    limitations: [
      'Limited to specified upload quota',
      'Standard processing priority',
      'Basic support response time'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For serious developers and small teams',
    icon: Rocket,
    badge: 'Most Popular',
    badgeColor: 'primary',
    popular: true,
    pricing: {
      weekly: { price: 19, uploads: 5, priceId: 'price_pro_weekly' },
      monthly: { price: 69, uploads: 20, priceId: 'price_pro_monthly' },
      quarterly: { price: 189, uploads: 65, priceId: 'price_pro_quarterly' },
      yearly: { price: 699, uploads: 260, priceId: 'price_pro_yearly' }
    },
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
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large teams and organizations',
    icon: Crown,
    badge: 'Best Value',
    badgeColor: 'secondary',
    enterprise: true,
    pricing: {
      weekly: { price: 49, uploads: 15, priceId: 'price_enterprise_weekly' },
      monthly: { price: 199, uploads: 60, priceId: 'price_enterprise_monthly' },
      quarterly: { price: 549, uploads: 200, priceId: 'price_enterprise_quarterly' },
      yearly: { price: 1999, uploads: 800, priceId: 'price_enterprise_yearly' }
    },
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
];

const billingPeriods = [
  { id: 'weekly', label: '1 Week', discount: 0 },
  { id: 'monthly', label: '1 Month', discount: 15 },
  { id: 'quarterly', label: '3 Months', discount: 25 },
  { id: 'yearly', label: '12 Months', discount: 35 }
];

const features = [
  {
    icon: Upload,
    title: 'Easy Model Upload',
    description: 'Drag & drop interface for uploading AI models with automatic IPFS storage'
  },
  {
    icon: Database,
    title: 'Decentralized Storage',
    description: 'Your models are stored on IPFS for maximum availability and decentralization'
  },
  {
    icon: TrendingUp,
    title: 'Revenue Analytics',
    description: 'Comprehensive analytics to track your model performance and earnings'
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Enterprise-grade security with SOC 2 compliance and data protection'
  },
  {
    icon: Globe,
    title: 'Global Marketplace',
    description: 'Reach developers worldwide through our decentralized AI marketplace'
  },
  {
    icon: Headphones,
    title: 'Developer Support',
    description: 'Dedicated support team to help you succeed with your AI models'
  }
];

const faqs = [
  {
    question: 'How does the upload quota work?',
    answer: 'Each subscription gives you a specific number of AI model uploads for the billing period. Unused uploads don\'t roll over to the next period.'
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.'
  },
  {
    question: 'What happens if I exceed my upload limit?',
    answer: 'You can purchase additional upload credits or upgrade to a higher plan. We\'ll notify you when you\'re approaching your limit.'
  },
  {
    question: 'How does revenue sharing work?',
    answer: 'You keep 90-95% of all revenue from your AI models (depending on your plan). We handle all payment processing and marketplace operations.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! New users get 1 free model upload to test our platform. No credit card required for the trial.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and cryptocurrency payments through Stripe.'
  }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { address, isConnected } = useAccount();

  // Refs for animations
  const heroRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBillingPeriod(isYearly ? 'yearly' : 'monthly');
  }, [isYearly]);

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
      );
    }

    // Cards animation
    if (cardsRef.current) {
      gsap.fromTo(cardsRef.current.children,
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.2, ease: "power3.out", delay: 0.5 }
      );
    }

    // Features animation
    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 1 }
      );
    }
  }, []);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(plan.id);

    try {
      // Get the price ID for the selected billing period
      const priceId = plan.pricing[billingPeriod].priceId;

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planId: plan.id,
          billingPeriod,
          walletAddress: address,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/pricing?subscription=cancelled`
        })
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe Checkout
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const calculateSavings = (plan: PricingPlan, period: keyof PricingPlan['pricing']) => {
    const weeklyPrice = plan.pricing.weekly.price;
    const periodPrice = plan.pricing[period].price;
    const periodWeeks = period === 'monthly' ? 4 : period === 'quarterly' ? 12 : 52;
    const regularPrice = weeklyPrice * periodWeeks;
    const savings = ((regularPrice - periodPrice) / regularPrice) * 100;
    return Math.round(savings);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="container text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <Badge variant="secondary" className="glass-effect px-4 py-2 text-sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Developer Pricing
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
            Upload & Monetize
            <br />
            <span className="text-gradient">Your AI Models</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            Choose the perfect plan to upload your AI agents to our decentralized marketplace. 
            Start earning from your models today.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isYearly ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                Save up to 35%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container px-4 sm:px-6">
          <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan) => {
              const Icon = plan.icon;
              const currentPricing = plan.pricing[billingPeriod];
              const savings = billingPeriod !== 'weekly' ? calculateSavings(plan, billingPeriod) : 0;

              return (
                <Card 
                  key={plan.id} 
                  className={`glass-effect border-border/40 relative overflow-hidden ${
                    plan.popular ? 'border-primary/50 scale-105' : ''
                  } ${plan.enterprise ? 'border-secondary/50' : ''}`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0 bg-primary text-black px-3 py-1 text-xs font-semibold rounded-bl-lg">
                      {plan.badge}
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Pricing */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gradient">${currentPricing.price}</span>
                        <span className="text-muted-foreground">/{billingPeriod === 'weekly' ? 'week' : billingPeriod === 'monthly' ? 'month' : billingPeriod === 'quarterly' ? '3 months' : 'year'}</span>
                      </div>
                      {savings > 0 && (
                        <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-400">
                          Save {savings}%
                        </Badge>
                      )}
                      <div className="mt-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4 inline mr-1" />
                        {currentPricing.uploads} AI model uploads
                      </div>
                    </div>

                    <Separator />

                    {/* Features */}
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.limitations && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground">Limitations:</h4>
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="text-xs text-muted-foreground">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button 
                      onClick={() => handleSubscribe(plan)}
                      disabled={loading === plan.id}
                      className={`w-full h-12 ${
                        plan.popular 
                          ? 'bg-primary text-black hover:bg-primary/90 neon-glow' 
                          : plan.enterprise
                          ? 'bg-secondary text-white hover:bg-secondary/90'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {loading === plan.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Subscribe Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Billing Period Tabs */}
          <div className="max-w-2xl mx-auto mt-12">
            <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 glass-effect">
                {billingPeriods.map((period) => (
                  <TabsTrigger key={period.id} value={period.id} className="relative">
                    {period.label}
                    {period.discount > 0 && (
                      <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs bg-primary/20 text-primary">
                        -{period.discount}%
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/20">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed in the AI marketplace
            </p>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="glass-effect border-border/40 text-center p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about our pricing
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="glass-effect border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
        <div className="container px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of developers already monetizing their AI models on our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-black hover:bg-primary/90 neon-glow" asChild>
                <a href="#pricing">
                  <Star className="h-5 w-5 mr-2" />
                  Choose Your Plan
                </a>
              </Button>
              <Button size="lg" variant="outline" className="glass-effect" asChild>
                <a href="/developer">
                  <Code className="h-5 w-5 mr-2" />
                  Try Free Upload
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}