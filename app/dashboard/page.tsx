'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { User, Zap, TestTube, Star, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  // Mock user data
  const userStats = {
    licensedAgents: 2,
    testsRun: 47,
    totalSpent: '0.089',
    joinDate: '2024-01-15'
  };

  const licensedAgents = [
    {
      id: '1',
      name: 'Text Summarizer Pro',
      category: 'Text Processing',
      licensedAt: '2024-03-10',
      usageCount: 34,
      lastUsed: '2024-03-15',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Image Caption Generator',
      category: 'Image Analysis',
      licensedAt: '2024-03-08',
      usageCount: 12,
      lastUsed: '2024-03-12',
      status: 'Active'
    }
  ];

  const recentTests = [
    {
      id: '1',
      agentName: 'Text Summarizer Pro',
      input: 'Long article about AI developments...',
      timestamp: '2024-03-15T10:30:00Z',
      latency: 380,
      result: 'Success'
    },
    {
      id: '2',
      agentName: 'Image Caption Generator',
      input: 'Uploaded image of a city street',
      timestamp: '2024-03-15T09:15:00Z',
      latency: 820,
      result: 'Success'
    },
    {
      id: '3',
      agentName: 'Sentiment Analyzer',
      input: 'This product is amazing!',
      timestamp: '2024-03-14T16:45:00Z',
      latency: 120,
      result: 'Success'
    }
  ];

  const subscriptionTiers = [
    {
      name: 'Starter',
      price: '$9/month',
      features: ['1 AI Agent License', '100 Tests/month', 'Basic Support'],
      current: false
    },
    {
      name: 'Pro',
      price: '$29/month',
      features: ['5 AI Agent Licenses', '1000 Tests/month', 'Priority Support', 'Advanced Analytics'],
      current: true
    },
    {
      name: 'Enterprise',
      price: '$99/month',
      features: ['Unlimited Licenses', 'Unlimited Tests', 'Dedicated Support', 'Custom Integration'],
      current: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              User Dashboard
            </h1>
            <p className="text-muted-foreground">
              {isConnected ? `Welcome back, ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect your wallet to access your dashboard'}
            </p>
          </div>

          {!isConnected ? (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your wallet to view your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  You need to connect your wallet to access your personal dashboard
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="licenses">Licenses</TabsTrigger>
                <TabsTrigger value="tests">Test History</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Licensed Agents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats.licensedAgents}</div>
                      <p className="text-xs text-muted-foreground">+1 this month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Tests Run
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats.testsRun}</div>
                      <p className="text-xs text-muted-foreground">+12 this week</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats.totalSpent} ETH</div>
                      <p className="text-xs text-muted-foreground">Since joining</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member Since
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Jan 2024</div>
                      <p className="text-xs text-muted-foreground">2 months ago</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks and shortcuts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-16 flex-col gap-2" asChild>
                        <Link href="/test">
                          <TestTube className="h-6 w-6" />
                          Test an Agent
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-16 flex-col gap-2" asChild>
                        <Link href="/">
                          <Zap className="h-6 w-6" />
                          Browse Marketplace
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-16 flex-col gap-2" asChild>
                        <Link href="/developer">
                          <TrendingUp className="h-6 w-6" />
                          Upload Agent
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest tests and interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTests.slice(0, 3).map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{test.agentName}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {test.input}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={test.result === 'Success' ? 'default' : 'destructive'}>
                              {test.result}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {test.latency}ms
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="licenses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Licensed Agents</CardTitle>
                    <CardDescription>
                      AI agents you have licensed for use
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {licensedAgents.map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground">{agent.category}</p>
                            <p className="text-xs text-muted-foreground">
                              Licensed on {new Date(agent.licensedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-sm font-semibold">{agent.usageCount}</div>
                              <div className="text-xs text-muted-foreground">Uses</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold">
                                {new Date(agent.lastUsed).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">Last Used</div>
                            </div>
                            <Badge variant="default">{agent.status}</Badge>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/test?agent=${agent.id}`}>
                                Test Now
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Test History</CardTitle>
                    <CardDescription>
                      Complete history of your AI agent tests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{test.agentName}</h3>
                              <Badge variant={test.result === 'Success' ? 'default' : 'destructive'}>
                                {test.result}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {test.input}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(test.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{test.latency}ms</div>
                            <div className="text-xs text-muted-foreground">Latency</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Plans</CardTitle>
                    <CardDescription>
                      Choose the plan that fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {subscriptionTiers.map((tier, index) => (
                        <Card key={index} className={tier.current ? 'border-primary bg-primary/5' : ''}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{tier.name}</CardTitle>
                              {tier.current && <Badge>Current</Badge>}
                            </div>
                            <div className="text-2xl font-bold">{tier.price}</div>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {tier.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="text-sm flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <Button 
                              className="w-full mt-4" 
                              variant={tier.current ? 'outline' : 'default'}
                              disabled={tier.current}
                            >
                              {tier.current ? 'Current Plan' : 'Upgrade'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Usage</CardTitle>
                    <CardDescription>
                      Your usage for the current billing period
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tests Used</span>
                        <span className="text-sm text-muted-foreground">47 / 1000</span>
                      </div>
                      <Progress value={4.7} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Licensed Agents</span>
                        <span className="text-sm text-muted-foreground">2 / 5</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}