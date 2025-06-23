'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Code, FileText, Zap, TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export default function DeveloperPage() {
  const { address, isConnected } = useAccount();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    priceEth: '',
    sampleInput: '',
    sampleOutput: '',
    language: 'Python'
  });

  const categories = [
    'Text Processing',
    'Image Analysis',
    'Data Analysis',
    'Code Generation',
    'Audio Processing',
    'Video Analysis'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Simulate IPFS upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setUploadProgress(100);
      toast.success('Model uploaded to IPFS successfully!');
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate form
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Simulate agent registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('AI Agent registered successfully! Your agent is now live in the marketplace.');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        priceEth: '',
        sampleInput: '',
        sampleOutput: '',
        language: 'Python'
      });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  // Enhanced developer stats
  const developerStats = {
    totalAgents: 3,
    totalEarnings: '0.156',
    totalUsage: 4392,
    averageRating: 4.6
  };

  const myAgents = [
    {
      id: '1',
      name: 'Text Summarizer Pro',
      category: 'Text Processing',
      usage: 2847,
      earnings: '0.089',
      rating: 4.8,
      status: 'Active'
    },
    {
      id: '2',
      name: 'Sentiment Analyzer',
      category: 'Text Processing',
      usage: 1653,
      earnings: '0.000',
      rating: 4.2,
      status: 'Active'
    },
    {
      id: '3',
      name: 'Code Optimizer',
      category: 'Code Generation',
      usage: 892,
      earnings: '0.067',
      rating: 4.9,
      status: 'Active'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Code className="h-8 w-8 text-primary" />
              Developer Portal
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload, monetize, and manage your AI agents on the decentralized marketplace
            </p>
          </div>

          {!isConnected ? (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your wallet to start uploading AI agents
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  You need to connect your wallet to access developer features
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload Agent</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Upload Form */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Upload AI Agent
                        </CardTitle>
                        <CardDescription>
                          Upload your AI model and configure its marketplace listing
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* File Upload */}
                          <div className="space-y-2">
                            <Label>Model File</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <div className="text-sm text-muted-foreground mb-2">
                                Upload your AI model file (.pkl, .pt, .h5, .onnx)
                              </div>
                              <input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".pkl,.pt,.h5,.onnx"
                                className="hidden"
                                id="model-upload"
                              />
                              <Label htmlFor="model-upload">
                                <Button variant="outline" type="button" disabled={isUploading}>
                                  Choose File
                                </Button>
                              </Label>
                              {isUploading && (
                                <div className="mt-4">
                                  <Progress value={uploadProgress} className="h-2" />
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Uploading to IPFS... {Math.round(uploadProgress)}%
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Basic Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Agent Name *</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Text Summarizer Pro"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Category *</Label>
                              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder="Describe what your AI agent does..."
                              rows={3}
                            />
                          </div>

                          {/* Pricing & Config */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="price">License Price (ETH)</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.001"
                                min="0"
                                value={formData.priceEth}
                                onChange={(e) => handleInputChange('priceEth', e.target.value)}
                                placeholder="0.01"
                              />
                              <div className="text-sm text-muted-foreground">
                                Set to 0 for free access
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="language">Programming Language</Label>
                              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Python">Python</SelectItem>
                                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                                  <SelectItem value="Go">Go</SelectItem>
                                  <SelectItem value="Rust">Rust</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Sample I/O */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="sample-input">Sample Input</Label>
                              <Textarea
                                id="sample-input"
                                value={formData.sampleInput}
                                onChange={(e) => handleInputChange('sampleInput', e.target.value)}
                                placeholder="Example input that users can test with..."
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sample-output">Expected Output</Label>
                              <Textarea
                                id="sample-output"
                                value={formData.sampleOutput}
                                onChange={(e) => handleInputChange('sampleOutput', e.target.value)}
                                placeholder="Expected output for the sample input..."
                                rows={2}
                              />
                            </div>
                          </div>

                          <Button type="submit" size="lg" className="w-full">
                            <Zap className="h-4 w-4 mr-2" />
                            Deploy Agent to Marketplace
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Guidelines */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Upload Guidelines</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Model Requirements</div>
                            <div className="text-muted-foreground">
                              Supported formats: .pkl, .pt, .h5, .onnx
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">IPFS Storage</div>
                            <div className="text-muted-foreground">
                              Your model is stored on IPFS for decentralization
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Smart Contract</div>
                            <div className="text-muted-foreground">
                              Licensing handled by Ethereum smart contracts
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium">Revenue Share</div>
                            <div className="text-muted-foreground">
                              You keep 90% of all licensing fees
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Connected Wallet</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          <div className="font-medium mb-1">Address:</div>
                          <code className="text-xs bg-muted p-1 rounded break-all">
                            {address}
                          </code>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Agents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{developerStats.totalAgents}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{developerStats.totalEarnings} ETH</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{developerStats.totalUsage.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Avg Rating
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{developerStats.averageRating}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* My Agents */}
                <Card>
                  <CardHeader>
                    <CardTitle>My AI Agents</CardTitle>
                    <CardDescription>
                      Manage and monitor your deployed agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myAgents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold">{agent.name}</h3>
                              <p className="text-sm text-muted-foreground">{agent.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-sm font-semibold">{agent.usage.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Uses</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold">{agent.earnings} ETH</div>
                              <div className="text-xs text-muted-foreground">Earned</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold">{agent.rating}</div>
                              <div className="text-xs text-muted-foreground">Rating</div>
                            </div>
                            <Badge variant="default">{agent.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>
                      Detailed insights into your agents' performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                      <p className="text-muted-foreground">
                        Detailed performance metrics and usage analytics will be available here.
                      </p>
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