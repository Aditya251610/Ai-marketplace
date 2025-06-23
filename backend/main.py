#!/usr/bin/env python3
"""
AI Agent Marketplace Backend
FastAPI server for AI model inference and testing
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import time
import random
import asyncio
import json
import hashlib
from datetime import datetime

app = FastAPI(
    title="AI Agent Marketplace API",
    description="Backend API for AI agent testing and inference",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class TestRequest(BaseModel):
    agent_id: str
    input_data: str
    user_address: Optional[str] = None

class TestResponse(BaseModel):
    output: str
    latency_ms: int
    cost_usd: float
    accuracy_score: int
    timestamp: str
    metadata: Dict[str, Any]

class AgentMetadata(BaseModel):
    id: str
    name: str
    category: str
    language: str
    ipfs_hash: str
    description: str

# Mock AI models for demonstration
MOCK_AGENTS = {
    "1": {
        "name": "Text Summarizer Pro",
        "category": "Text Processing",
        "language": "Python",
        "description": "Advanced text summarization using BART-Large-CNN",
        "model_type": "summarization"
    },
    "2": {
        "name": "Sentiment Analyzer",
        "category": "Text Processing", 
        "language": "Python",
        "description": "Real-time sentiment analysis",
        "model_type": "sentiment"
    },
    "3": {
        "name": "Image Caption Generator",
        "category": "Image Analysis",
        "language": "Python", 
        "description": "Generate captions for images",
        "model_type": "image_caption"
    }
}

def mock_text_summarization(text: str) -> str:
    """Mock text summarization"""
    sentences = text.split('.')
    if len(sentences) <= 2:
        return text.strip()
    
    # Simulate summarization by taking key sentences
    summary_sentences = sentences[:2] if len(sentences) > 3 else sentences[:1]
    summary = '. '.join(s.strip() for s in summary_sentences if s.strip())
    
    if not summary.endswith('.'):
        summary += '.'
    
    return f"Summary: {summary} This represents a condensed version of the original text, highlighting the main points and key information."

def mock_sentiment_analysis(text: str) -> str:
    """Mock sentiment analysis"""
    positive_words = ['love', 'great', 'amazing', 'excellent', 'wonderful', 'fantastic', 'good', 'perfect']
    negative_words = ['hate', 'terrible', 'awful', 'bad', 'horrible', 'worst', 'disappointing']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        confidence = min(85 + positive_count * 5, 98)
        return f"Positive sentiment detected (confidence: {confidence}%)"
    elif negative_count > positive_count:
        confidence = min(80 + negative_count * 5, 95)
        return f"Negative sentiment detected (confidence: {confidence}%)"
    else:
        return "Neutral sentiment detected (confidence: 75%)"

def mock_image_caption(input_data: str) -> str:
    """Mock image caption generation"""
    # Simulate different types of image content
    captions = [
        "A person walking through a busy city street with tall buildings in the background",
        "A beautiful landscape with mountains, trees, and a clear blue sky",
        "A group of people sitting around a table in a modern office environment",
        "A close-up view of colorful flowers in a garden setting",
        "An urban scene with cars, pedestrians, and architectural details visible"
    ]
    
    # Use input hash to determine consistent caption
    input_hash = hashlib.md5(input_data.encode()).hexdigest()
    caption_index = int(input_hash[:2], 16) % len(captions)
    
    return f"Caption: {captions[caption_index]}. This image shows detailed visual elements with good composition and lighting."

async def simulate_model_inference(agent_id: str, input_data: str) -> Dict[str, Any]:
    """Simulate AI model inference with realistic delays"""
    
    if agent_id not in MOCK_AGENTS:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = MOCK_AGENTS[agent_id]
    
    # Simulate processing time based on model type
    processing_times = {
        "summarization": (300, 600),  # 300-600ms
        "sentiment": (100, 250),      # 100-250ms  
        "image_caption": (600, 1200)  # 600-1200ms
    }
    
    min_time, max_time = processing_times.get(agent["model_type"], (200, 400))
    latency = random.randint(min_time, max_time)
    
    # Simulate actual processing delay
    await asyncio.sleep(latency / 1000.0)
    
    # Generate output based on model type
    if agent["model_type"] == "summarization":
        output = mock_text_summarization(input_data)
    elif agent["model_type"] == "sentiment":
        output = mock_sentiment_analysis(input_data)
    elif agent["model_type"] == "image_caption":
        output = mock_image_caption(input_data)
    else:
        output = f"Processed input: {input_data[:100]}..."
    
    # Calculate mock metrics
    cost_usd = random.uniform(0.0001, 0.005)
    accuracy_score = random.randint(75, 98)
    
    return {
        "output": output,
        "latency_ms": latency,
        "cost_usd": round(cost_usd, 6),
        "accuracy_score": accuracy_score,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Agent Marketplace API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/agents")
async def list_agents():
    """List all available agents"""
    return {
        "agents": [
            {
                "id": agent_id,
                **agent_data
            }
            for agent_id, agent_data in MOCK_AGENTS.items()
        ]
    }

@app.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get specific agent details"""
    if agent_id not in MOCK_AGENTS:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return {
        "id": agent_id,
        **MOCK_AGENTS[agent_id]
    }

@app.post("/test", response_model=TestResponse)
async def test_agent(request: TestRequest):
    """Test an AI agent with provided input"""
    
    if not request.input_data.strip():
        raise HTTPException(status_code=400, detail="Input data cannot be empty")
    
    try:
        # Simulate model inference
        result = await simulate_model_inference(request.agent_id, request.input_data)
        
        # Add metadata
        result["metadata"] = {
            "agent_id": request.agent_id,
            "agent_name": MOCK_AGENTS.get(request.agent_id, {}).get("name", "Unknown"),
            "input_length": len(request.input_data),
            "user_address": request.user_address,
            "processing_node": "node-001",
            "model_version": "1.0.0"
        }
        
        return TestResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

@app.post("/agents/{agent_id}/benchmark")
async def benchmark_agent(agent_id: str, background_tasks: BackgroundTasks):
    """Run comprehensive benchmarks on an agent"""
    
    if agent_id not in MOCK_AGENTS:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Simulate benchmark tests
    test_inputs = [
        "Short test input for basic functionality",
        "Medium length test input to evaluate performance with moderate complexity and processing requirements",
        "Very long test input designed to stress test the model with extensive content that requires significant processing power and memory usage to handle effectively while maintaining accuracy and performance standards throughout the entire inference process"
    ]
    
    benchmark_results = []
    
    for i, test_input in enumerate(test_inputs):
        result = await simulate_model_inference(agent_id, test_input)
        benchmark_results.append({
            "test_case": i + 1,
            "input_length": len(test_input),
            **result
        })
    
    # Calculate aggregate metrics
    avg_latency = sum(r["latency_ms"] for r in benchmark_results) / len(benchmark_results)
    avg_cost = sum(r["cost_usd"] for r in benchmark_results) / len(benchmark_results)
    avg_accuracy = sum(r["accuracy_score"] for r in benchmark_results) / len(benchmark_results)
    
    return {
        "agent_id": agent_id,
        "benchmark_summary": {
            "average_latency_ms": round(avg_latency, 2),
            "average_cost_usd": round(avg_cost, 6),
            "average_accuracy": round(avg_accuracy, 2),
            "total_tests": len(benchmark_results)
        },
        "detailed_results": benchmark_results,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "running",
            "models": "loaded",
            "database": "connected"
        },
        "metrics": {
            "total_agents": len(MOCK_AGENTS),
            "uptime_seconds": time.time()
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )