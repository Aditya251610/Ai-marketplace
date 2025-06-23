'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Mail, 
  User, 
  Building, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Users,
  TrendingUp,
  Bot,
  Star,
  Globe,
  Shield,
  Rocket,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { gsap } from 'gsap';

type WaitlistFormData = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  useCase: string;
  interests: string[];
  referralSource: string;
  newsletter: boolean;
};

const roles = [
  'Developer',
  'Data Scientist',
  'Product Manager',
  'Researcher',
  'Entrepreneur',
  'Student',
  'Other'
];

const useCases = [
  'Building AI Applications',
  'Research & Development',
  'Business Automation',
  'Educational Projects',
  'Personal Projects',
  'Enterprise Solutions'
];

const interests = [
  'Text Processing',
  'Image Analysis',
  'Code Generation',
  'Data Analysis',
  'Audio Processing',
  'Video Analysis',
  'Natural Language Processing',
  'Computer Vision',
  'Machine Learning',
  'Deep Learning'
];

const referralSources = [
  'Search Engine',
  'Social Media',
  'Friend/Colleague',
  'Tech Blog',
  'Conference/Event',
  'GitHub',
  'Other'
];

const benefits = [
  {
    icon: Rocket,
    title: 'Early Access',
    description: 'Be among the first to access our AI marketplace when we launch'
  },
  {
    icon: Star,
    title: 'Exclusive Features',
    description: 'Get access to premium features and advanced AI models'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join our exclusive community of AI developers and researchers'
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Receive priority customer support and technical assistance'
  }
];

const stats = [
  { label: 'Developers Waiting', value: '2,847', icon: Users },
  { label: 'AI Models Ready', value: '150+', icon: Bot },
  { label: 'Countries', value: '45', icon: Globe },
  { label: 'Success Rate', value: '98%', icon: TrendingUp }
];

export default function WaitlistPage() {
  const [formData, setFormData] = useState<WaitlistFormData>({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
    useCase: '',
    interests: [],
    referralSource: '',
    newsletter: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);

  // Refs for animations
  const heroRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero section animations
    if (heroRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(heroRef.current.querySelector('.hero-badge'),
        { y: 50, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
      )
      .fromTo(heroRef.current.querySelector('.hero-title'),
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
        "-=0.8"
      )
      .fromTo(heroRef.current.querySelector('.hero-subtitle'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
        "-=0.8"
      );
    }

    // Form animation
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.5 }
      );
    }

    // Stats animation
    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children,
        { y: 50, opacity: 0, scale: 0.8 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: "back.out(1.7)",
          delay: 0.8
        }
      );
    }
  }, []);

  const handleInputChange = (field: keyof WaitlistFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const submitToWaitlist = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Submit to our API endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('This email is already on our waitlist!');
          return;
        }
        throw new Error(result.error || 'Failed to join waitlist');
      }

      setPosition(result.position);
      setIsSubmitted(true);
      
      // Success animation
      if (formRef.current) {
        gsap.to(formRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
          yoyo: true,
          repeat: 1
        });
      }

      toast.success('🎉 Successfully joined the waitlist! Check your email for confirmation.');

    } catch (error) {
      console.error('Waitlist submission error:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen gradient-bg">
        <Header />
        
        <div className="container py-24 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-6 neon-glow">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                Welcome to the Future! 🎉
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                You're successfully on the AI Nexus waitlist
              </p>
            </div>

            <Card className="glass-effect border-border/40 p-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gradient mb-2">
                  #{position?.toLocaleString()}
                </div>
                <p className="text-muted-foreground">Your position in line</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Send className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Welcome email sent!</span>
                </div>
                
                <h3 className="font-semibold text-lg">What happens next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Check your email for a welcome message with your position</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">We'll send you exclusive updates about our progress</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">You'll get early access when we launch</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Exclusive access to premium AI models and features</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-border/40">
                <p className="text-sm text-muted-foreground mb-4">
                  Share AI Nexus with friends and move up the waitlist faster!
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      const tweetText = `Just joined the AI Nexus waitlist! The future of decentralized AI is coming. Join me: https://ainexus.com/waitlist?ref=${encodeURIComponent(formData.email)}`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                    }}
                  >
                    Share on Twitter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://ainexus.com/waitlist?ref=${encodeURIComponent(formData.email)}`);
                      toast.success('Referral link copied to clipboard!');
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="container text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="hero-badge mb-6">
            <Badge variant="secondary" className="glass-effect px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Join the Revolution
            </Badge>
          </div>
          
          <div className="hero-title mb-6">
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
              Be First to Access the
              <br />
              <span className="text-gradient">AI Nexus Marketplace</span>
            </h1>
          </div>
          
          <div className="hero-subtitle mb-12">
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers, researchers, and innovators waiting for the next generation 
              of decentralized AI tools.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container px-4 sm:px-6">
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="glass-effect border-border/40 text-center p-6">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Benefits */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Why Join the Waitlist?</h2>
                <p className="text-muted-foreground">
                  Get exclusive early access and be part of the AI revolution from day one.
                </p>
              </div>

              <div className="space-y-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <Send className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-primary">Instant Email Confirmation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll receive a welcome email immediately after joining with your waitlist position, 
                  exclusive updates, and a referral link to move up faster!
                </p>
              </div>
            </div>

            {/* Waitlist Form */}
            <div ref={formRef}>
              <Card className="glass-effect border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Join the Waitlist
                  </CardTitle>
                  <CardDescription>
                    Reserve your spot and get instant email confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                        className="glass-effect border-border/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                        className="glass-effect border-border/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                      className="glass-effect border-border/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Acme Corp"
                      className="glass-effect border-border/40"
                    />
                  </div>

                  {/* Role & Use Case */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger className="glass-effect border-border/40">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Use Case</Label>
                      <Select value={formData.useCase} onValueChange={(value) => handleInputChange('useCase', value)}>
                        <SelectTrigger className="glass-effect border-border/40">
                          <SelectValue placeholder="How will you use AI Nexus?" />
                        </SelectTrigger>
                        <SelectContent>
                          {useCases.map((useCase) => (
                            <SelectItem key={useCase} value={useCase}>
                              {useCase}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="space-y-3">
                    <Label>Areas of Interest (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {interests.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest}
                            checked={formData.interests.includes(interest)}
                            onCheckedChange={() => handleInterestToggle(interest)}
                          />
                          <Label htmlFor={interest} className="text-sm">
                            {interest}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Referral Source */}
                  <div className="space-y-2">
                    <Label>How did you hear about us?</Label>
                    <Select value={formData.referralSource} onValueChange={(value) => handleInputChange('referralSource', value)}>
                      <SelectTrigger className="glass-effect border-border/40">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {referralSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Newsletter Consent */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange('newsletter', checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      I want to receive updates about AI Nexus and related products
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    onClick={submitToWaitlist}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary text-black hover:bg-primary/90 neon-glow"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Joining Waitlist...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Join Waitlist & Get Email
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By joining, you agree to our Terms of Service and Privacy Policy.
                    You'll receive an instant confirmation email with your position.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}