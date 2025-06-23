'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';

const navigation = [
  { name: 'For Users', href: '/' },
  { name: 'For Creators', href: '/developer' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current && logoRef.current && navRef.current) {
      // Initial animation
      gsap.fromTo(headerRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(logoRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)", delay: 0.3 }
      );

      gsap.fromTo(navRef.current.children,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 }
      );
    }
  }, []);

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotation: 360,
        scale: 1.1,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  };

  const handleLogoLeave = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  };

  return (
    <header 
      ref={headerRef}
      className="fixed top-0 z-50 w-full glass-effect border-b border-border/40 backdrop-blur-xl"
    >
      <div className="container flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div 
              ref={logoRef}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent neon-glow"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
            >
              <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl brand-logo">Perspective AI</span>
            </div>
          </Link>

          <nav ref={navRef} className="hidden lg:flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'nav-pill',
                  pathname === item.href && 'active'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex nav-pill border-primary/30 text-primary hover:bg-primary/10"
          >
            Join Waitlist
          </Button>
          
          <div className="hidden sm:block">
            <ConnectButton />
          </div>
          
          <div className="block sm:hidden">
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 glass-effect border-l border-border/40">
              <div className="flex flex-col gap-6 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold brand-logo mb-2">Perspective AI</div>
                </div>
                
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-105',
                      pathname === item.href
                        ? 'bg-primary/20 text-primary neon-glow'
                        : 'text-muted-foreground'
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="mt-6 pt-6 border-t border-border/40">
                  <Button className="w-full mb-4 nav-pill bg-primary text-black hover:bg-primary/90">
                    Join Waitlist
                  </Button>
                  <ConnectButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}