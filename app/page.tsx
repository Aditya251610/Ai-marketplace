'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, Filter, Zap, Users, TrendingUp, Bot, Code, TestTube, Sparkles, ArrowRight, Play } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';
import { gsap } from 'gsap';

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  price_eth: string;
  rating: number;
  total_ratings: number;
  usage_count?: number;
  creator_address?: string;
  sample_input: string;
  sample_output: string;
  language: string;
};

const categories = ['All', 'Text Processing', 'Image Analysis', 'Data Analysis', 'Code Generation'];

// Fallback seed data
const seedAgents: Agent[] = [
  {
    id: '1',
    name: 'Neural Text Synthesizer',
    description: 'Advanced text generation using transformer architecture with contextual understanding and creative writing capabilities',
    category: 'Text Processing',
    price_eth: '0.01',
    rating: 4.8,
    total_ratings: 124,
    usage_count: 2847,
    creator_address: '0x123456789abcdef123456789abcdef1234567890',
    sample_input: 'Write a compelling story about AI and humanity...',
    sample_output: 'In a world where artificial minds dream of electric sheep...',
    language: 'Python',
  },
  {
    id: '2',
    name: 'Quantum Sentiment Oracle',
    description: 'Next-generation sentiment analysis with quantum-inspired algorithms for nuanced emotional understanding',
    category: 'Text Processing',
    price_eth: '0',
    rating: 4.2,
    total_ratings: 89,
    usage_count: 1653,
    creator_address: '0x123456789abcdef123456789abcdef1234567890',
    sample_input: 'This revolutionary product exceeded all my expectations!',
    sample_output: 'Extremely Positive (confidence: 94.7%) - Enthusiasm detected',
    language: 'Python',
  },
  {
    id: '3',
    name: 'Vision Narrative Engine',
    description: 'State-of-the-art computer vision model that generates rich, contextual narratives from visual content',
    category: 'Image Analysis',
    price_eth: '0.02',
    rating: 4.9,
    total_ratings: 67,
    usage_count: 892,
    creator_address: '0x456789abcdef123456789abcdef123456789abcde',
    sample_input: '[Image: Futuristic cityscape at sunset]',
    sample_output: 'A breathtaking metropolis rises against the golden horizon...',
    language: 'Python',
  },
  {
    id: '4',
    name: 'Code Architect AI',
    description: 'Intelligent code optimization and architecture suggestions with performance enhancement capabilities',
    category: 'Code Generation',
    price_eth: '0.015',
    rating: 4.6,
    total_ratings: 43,
    usage_count: 567,
    creator_address: '0x789abcdef123456789abcdef123456789abcdef12',
    sample_input: 'Optimize this React component for better performance...',
    sample_output: 'Refactored with useMemo, useCallback, and lazy loading...',
    language: 'JavaScript',
  },
  {
    id: '5',
    name: 'Data Insight Synthesizer',
    description: 'Advanced analytics engine that extracts meaningful patterns and predictions from complex datasets',
    category: 'Data Analysis',
    price_eth: '0.025',
    rating: 4.7,
    total_ratings: 78,
    usage_count: 1234,
    creator_address: '0x9abcdef123456789abcdef123456789abcdef123',
    sample_input: 'Analyze customer behavior patterns from e-commerce data...',
    sample_output: 'Identified 3 key segments with 87% accuracy prediction...',
    language: 'Python',
  },
  {
    id: '6',
    name: 'Polyglot Translator Pro',
    description: 'Ultra-precise translation engine with cultural context awareness and idiomatic expression handling',
    category: 'Text Processing',
    price_eth: '0.005',
    rating: 4.4,
    total_ratings: 156,
    usage_count: 3421,
    creator_address: '0xabcdef123456789abcdef123456789abcdef1234',
    sample_input: 'Translate with cultural nuance: "Break a leg at your performance!"',
    sample_output: '¡Que tengas mucho éxito en tu actuación! (Good luck with your performance!)',
    language: 'Python',
  },
];

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Refs for animations
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchQuery, selectedCategory]);

  useEffect(() => {
    // Hero section animations
    if (heroRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(heroRef.current.querySelector('.hero-title'),
        { y: 100, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
      )
      .fromTo(heroRef.current.querySelector('.hero-subtitle'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
        "-=0.8"
      )
      .fromTo(heroRef.current.querySelector('.hero-buttons'),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.6"
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
          delay: 0.5
        }
      );
    }
  }, []);

  useEffect(() => {
    // Animate cards when they load
    if (cardsRef.current && !loading) {
      gsap.fromTo(cardsRef.current.children,
        { y: 100, opacity: 0, rotationX: -15 },
        { 
          y: 0, 
          opacity: 1, 
          rotationX: 0,
          duration: 0.8, 
          stagger: 0.1, 
          ease: "power3.out",
          delay: 0.2
        }
      );
    }
  }, [loading, filteredAgents]);

  const fetchAgents = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setAgents(data);
        } else {
          setAgents(seedAgents);
        }
      } else {
        setAgents(seedAgents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents(seedAgents);
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    if (searchQuery) {
      filtered = filtered.filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((agent) => agent.category === selectedCategory);
    }

    setFilteredAgents(filtered);
  };

  const formatPrice = (priceEth: string) => {
    return priceEth === '0' ? 'Free' : `${priceEth} ETH`;
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen gradient-bg mesh-gradient">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="container py-12 sm:py-20 text-center max-w-6xl mx-auto px-4 sm:px-6">
        <div className="hero-title">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gradient leading-tight">
            Discover the Future
            <br />
            <span className="inline-flex items-center gap-2 sm:gap-4">
              of AI Agents
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-accent floating-animation" />
            </span>
          </h1>
        </div>
        
        <div className="hero-subtitle">
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
            Test, license, and deploy cutting-edge AI models in our decentralized marketplace.
            <br className="hidden sm:block" />
            Built with blockchain technology and IPFS storage for the next generation.
          </p>
        </div>
        
        <div className="hero-buttons flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-20">
          <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg gap-2 sm:gap-3 neon-glow hover:scale-105 transition-all duration-300" asChild>
            <Link href="/test">
              <Play className="h-5 w-5 sm:h-6 sm:w-6" />
              Start Testing
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg gap-2 sm:gap-3 glass-effect hover:scale-105 transition-all duration-300" asChild>
            <Link href="/developer">
              <Code className="h-5 w-5 sm:h-6 sm:w-6" />
              Build & Earn
            </Link>
          </Button>
        </div>
        
        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 mb-16 sm:mb-24">
          <div className="glass-effect p-6 sm:p-8 rounded-2xl card-3d">
            <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4 pulse-glow" />
            <div className="text-3xl sm:text-4xl font-bold text-gradient">{agents.length}+</div>
            <div className="text-muted-foreground text-sm sm:text-base">AI Agents</div>
          </div>
          <div className="glass-effect p-6 sm:p-8 rounded-2xl card-3d">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-accent mx-auto mb-3 sm:mb-4 pulse-glow" />
            <div className="text-3xl sm:text-4xl font-bold text-gradient">2.5K+</div>
            <div className="text-muted-foreground text-sm sm:text-base">Active Users</div>
          </div>
          <div className="glass-effect p-6 sm:p-8 rounded-2xl card-3d">
            <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-success mx-auto mb-3 sm:mb-4 pulse-glow" />
            <div className="text-3xl sm:text-4xl font-bold text-gradient">50K+</div>
            <div className="text-muted-foreground text-sm sm:text-base">Tests Run</div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="container mb-8 sm:mb-12 px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search AI agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 sm:h-14 text-base glass-effect border-border/40 focus:border-primary/50 transition-all duration-300"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-64 h-12 sm:h-14 glass-effect border-border/40">
              <Filter className="h-5 w-5 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="glass-effect border-border/40">
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="focus:bg-primary/10">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="container pb-16 sm:pb-24 px-4 sm:px-6">
        {loading ? (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-effect border-border/40 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted/30 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted/20 rounded mb-4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <Bot className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">No agents found</h3>
            <p className="text-muted-foreground text-base sm:text-lg">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {filteredAgents.map((agent, index) => (
              <Card 
                key={agent.id} 
                className="glass-effect border-border/40 card-3d group hover:border-primary/30 transition-all duration-500 overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base line-clamp-3">
                        {agent.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-3 shrink-0 glass-effect">
                      {agent.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="glass-effect p-3 sm:p-4 rounded-xl">
                    <div className="text-xs sm:text-sm font-medium mb-2 text-primary">Sample Input:</div>
                    <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {agent.sample_input}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({agent.total_ratings})</span>
                    </div>
                    <div className="text-muted-foreground">
                      {(agent.usage_count ?? 0).toLocaleString()} uses
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      by {formatAddress(agent.creator_address ?? '')}
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-bold text-gradient">
                        {formatPrice(agent.price_eth)}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {agent.language}
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 glass-effect hover:bg-primary/10 hover:border-primary/50 transition-all duration-300" 
                    asChild
                  >
                    <Link href={`/test?agent=${agent.id}`}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 neon-glow hover:scale-105 transition-all duration-300"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    License
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}