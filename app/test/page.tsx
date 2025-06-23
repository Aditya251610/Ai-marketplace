'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TestTube, Play, Clock, DollarSign, Zap, Star, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type TestResult = {
  output: string;
  latency_ms: number;
  cost_usd: number;
  accuracy_score: number;
  timestamp: string;
};

type Agent = {
  id: string;
  name: string;
  description: string;
  category: string;
  price_eth: string;
  rating: number;
  sample_input: string;
  sample_output: string;
  language: string;
};

export default function TestPage() {
  const searchParams = useSearchParams();
  const agentId = searchParams?.get('agent');
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [input, setInput] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);

  // Seed data for demo
  const sampleAgents: Agent[] = [
    {
      id: '1',
      name: 'Text Summarizer Pro',
      description: 'Advanced text summarization using BART-Large-CNN model',
      category: 'Text Processing',
      price_eth: '0.01',
      rating: 4.8,
      sample_input: 'Long news article or document text...',
      sample_output: 'Concise, accurate summary preserving key information',
      language: 'Python'
    },
    {
      id: '2',
      name: 'Sentiment Analyzer',
      description: 'Real-time sentiment analysis for text and social media',
      category: 'Text Processing',
      price_eth: '0',
      rating: 4.2,
      sample_input: 'I love this product! It works perfectly.',
      sample_output: 'Positive (confidence: 92%)',
      language: 'Python'
    },
    {
      id: '3',
      name: 'Image Caption Generator',
      description: 'Generate detailed captions for images using computer vision',
      category: 'Image Analysis',
      price_eth: '0.02',
      rating: 4.9,
      sample_input: '[Image upload - person riding bicycle]',
      sample_output: 'A person riding a blue bicycle through a busy city street',
      language: 'Python'
    }
  ];

  useEffect(() => {
    if (agentId) {
      const agent = sampleAgents.find(a => a.id === agentId);
      if (agent) {
        setSelectedAgent(agent);
        setInput(agent.sample_input);
      }
    } else {
      setSelectedAgent(sampleAgents[0]);
      setInput(sampleAgents[0].sample_input);
    }
  }, [agentId]);

  const runTest = async () => {
    if (!selectedAgent || !input.trim()) {
      toast.error('Please select an agent and provide input');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test result
      const mockResult: TestResult = {
        output: selectedAgent.id === '1' 
          ? 'This is a concise summary of the provided text, highlighting the key points and main ideas while maintaining the essential information.'
          : selectedAgent.id === '2'
          ? 'Positive sentiment detected (confidence: 94.2%)'
          : 'A detailed caption describing the visual elements and context of the uploaded image.',
        latency_ms: Math.floor(Math.random() * 800) + 200,
        cost_usd: parseFloat((Math.random() * 0.01).toFixed(4)),
        accuracy_score: Math.floor(Math.random() * 20) + 80,
        timestamp: new Date().toISOString()
      };

      setTestResult(mockResult);
      setTestHistory(prev => [mockResult, ...prev.slice(0, 4)]);
      toast.success('Test completed successfully!');
    } catch (error) {
      toast.error('Test failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <TestTube className="h-8 w-8 text-primary" />
              AI Agent Testing Sandbox
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test AI agents with your own input and see real-time performance benchmarks
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Agent Selection & Input */}
            <div className="lg:col-span-2 space-y-6">
              {/* Agent Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Select Agent
                  </CardTitle>
                  <CardDescription>
                    Choose an AI agent to test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sampleAgents.map((agent) => (
                      <div
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgent(agent);
                          setInput(agent.sample_input);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedAgent?.id === agent.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{agent.name}</h3>
                          <Badge variant="outline">{agent.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {agent.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{agent.rating}</span>
                          </div>
                          <span className="text-sm font-semibold">
                            {agent.price_eth === '0' ? 'Free' : `${agent.price_eth} ETH`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Input</CardTitle>
                  <CardDescription>
                    Enter the input you want to test with the selected agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your test input here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={runTest} 
                    disabled={loading || !selectedAgent || !input.trim()}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        Running Test...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Run Test
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column - Results & Benchmarks */}
            <div className="space-y-6">
              {/* Current Test Result */}
              {testResult && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-primary">Test Result</CardTitle>
                    <CardDescription>
                      Latest test output and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Output:</h4>
                      <div className="bg-background p-3 rounded-lg text-sm">
                        {testResult.output}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">Performance Metrics:</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Latency</span>
                          </div>
                          <span className="font-semibold">{testResult.latency_ms}ms</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">Cost</span>
                          </div>
                          <span className="font-semibold">${testResult.cost_usd}</span>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              <span className="text-sm">Accuracy</span>
                            </div>
                            <span className="font-semibold">{testResult.accuracy_score}%</span>
                          </div>
                          <Progress value={testResult.accuracy_score} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Agent Info */}
              {selectedAgent && (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedAgent.name}</CardTitle>
                    <CardDescription>{selectedAgent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Category</span>
                        <Badge variant="secondary">{selectedAgent.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Language</span>
                        <span className="font-semibold">{selectedAgent.language}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">License Price</span>
                        <span className="font-semibold">
                          {selectedAgent.price_eth === '0' ? 'Free' : `${selectedAgent.price_eth} ETH`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{selectedAgent.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      License This Agent
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Test History */}
              {testHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {testHistory.map((test, index) => (
                        <div
                          key={index}
                          className="p-2 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {new Date(test.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="font-semibold">{test.latency_ms}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}