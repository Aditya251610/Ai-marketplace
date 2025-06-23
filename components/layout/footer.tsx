'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Zap, Github, Twitter, MessageCircle, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(footerRef.current,
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            end: "bottom 100%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="glass-effect border-t border-border/40 backdrop-blur-xl">
      <div className="container py-12 sm:py-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent neon-glow">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl sm:text-2xl text-gradient">AI Nexus</span>
                <div className="text-xs sm:text-sm text-muted-foreground">Beta</div>
              </div>
            </div>
            <p className="text-muted-foreground max-w-md mb-6 text-sm sm:text-base leading-relaxed">
              The next-generation decentralized marketplace for AI agents. Test, license, and deploy 
              AI models with blockchain-based licensing and IPFS storage for a truly decentralized future.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
              >
                <Github className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
              >
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm sm:text-base hover:translate-x-1"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link 
                  href="/test" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm sm:text-base hover:translate-x-1"
                >
                  Test Agents
                </Link>
              </li>
              <li>
                <Link 
                  href="/developer" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm sm:text-base hover:translate-x-1"
                >
                  Developer Tools
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm sm:text-base hover:translate-x-1"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm sm:text-base hover:translate-x-1"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm sm:text-base hover:translate-x-1"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm sm:text-base hover:translate-x-1"
                >
                  Smart Contracts
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm sm:text-base hover:translate-x-1"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
            © 2025 AI Nexus Marketplace. Built with ❤️ for the decentralized future.
          </p>
          <div className="flex items-center gap-6">
            <Link 
              href="#" 
              className="text-muted-foreground hover:text-primary text-xs sm:text-sm transition-all duration-300"
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              className="text-muted-foreground hover:text-primary text-xs sm:text-sm transition-all duration-300"
            >
              Terms of Service
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}