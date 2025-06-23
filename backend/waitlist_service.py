#!/usr/bin/env python3
"""
Waitlist Service for AI Agent Marketplace
Handles waitlist management, email notifications, and analytics
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import asyncio
import json
import hashlib
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from supabase import create_client, Client

app = FastAPI(
    title="AI Nexus Waitlist Service",
    description="Backend service for waitlist management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_ANON_KEY", "")
supabase: Client = create_client(supabase_url, supabase_key)

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@ainexus.com")

# Data models
class WaitlistEntry(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    company: Optional[str] = None
    role: Optional[str] = None
    use_case: Optional[str] = None
    interests: Optional[List[str]] = []
    referral_source: Optional[str] = None
    newsletter_consent: bool = True

class WaitlistResponse(BaseModel):
    success: bool
    message: str
    position: Optional[int] = None
    total_count: Optional[int] = None

class WaitlistStats(BaseModel):
    total: int
    recent: int
    by_status: Dict[str, int]
    top_referral_sources: List[Dict[str, Any]]
    growth_rate: float

async def send_welcome_email(email: str, first_name: str, position: int):
    """Send welcome email to new waitlist member"""
    try:
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print(f"Email not configured, would send welcome email to {email}")
            return

        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Welcome to AI Nexus, {first_name}! You're #{position} in line"
        msg['From'] = FROM_EMAIL
        msg['To'] = email

        # HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to AI Nexus</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #10b981); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AI Nexus!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">The Future of Decentralized AI</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h2 style="color: #22c55e; margin: 0 0 10px 0; font-size: 48px;">#{position}</h2>
                <p style="margin: 0; font-size: 18px; color: #666;">Your position in line</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #333; margin-bottom: 15px;">Hi {first_name},</h3>
                <p>Thank you for joining the AI Nexus waitlist! You're now part of an exclusive community of developers, researchers, and innovators who are shaping the future of AI.</p>
                
                <h4 style="color: #22c55e; margin-top: 25px;">What happens next?</h4>
                <ul style="padding-left: 20px;">
                    <li style="margin-bottom: 10px;">We'll keep you updated on our progress with exclusive insights</li>
                    <li style="margin-bottom: 10px;">You'll get early access when we launch</li>
                    <li style="margin-bottom: 10px;">Access to premium AI models and features</li>
                    <li style="margin-bottom: 10px;">Priority support and community access</li>
                </ul>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                <h4 style="color: #333; margin-top: 0;">Move up the waitlist faster!</h4>
                <p style="margin-bottom: 15px;">Share AI Nexus with friends and colleagues to improve your position:</p>
                <div style="text-align: center;">
                    <a href="https://ainexus.com/waitlist?ref={email}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">Share with Friends</a>
                </div>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                <p>AI Nexus - The Decentralized AI Marketplace</p>
                <p>
                    <a href="https://ainexus.com" style="color: #22c55e;">Visit our website</a> | 
                    <a href="mailto:support@ainexus.com" style="color: #22c55e;">Contact support</a>
                </p>
            </div>
        </body>
        </html>
        """

        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"Welcome email sent to {email}")

    except Exception as e:
        print(f"Failed to send welcome email to {email}: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Nexus Waitlist Service",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/waitlist/join", response_model=WaitlistResponse)
async def join_waitlist(
    entry: WaitlistEntry, 
    request: Request,
    background_tasks: BackgroundTasks
):
    """Add user to waitlist"""
    try:
        # Get client IP and user agent
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")

        # Insert into Supabase
        result = supabase.table('waitlist').insert({
            'email': entry.email,
            'first_name': entry.first_name,
            'last_name': entry.last_name,
            'company': entry.company,
            'role': entry.role,
            'use_case': entry.use_case,
            'interests': entry.interests,
            'referral_source': entry.referral_source,
            'newsletter_consent': entry.newsletter_consent,
            'ip_address': client_ip,
            'user_agent': user_agent
        }).execute()

        if result.data:
            # Get total count for position
            count_result = supabase.table('waitlist').select('*', count='exact').execute()
            total_count = count_result.count or 1
            
            # Send welcome email in background
            background_tasks.add_task(
                send_welcome_email, 
                entry.email, 
                entry.first_name, 
                total_count
            )

            return WaitlistResponse(
                success=True,
                message="Successfully joined the waitlist!",
                position=total_count,
                total_count=total_count
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to join waitlist")

    except Exception as e:
        if "duplicate key value" in str(e).lower():
            raise HTTPException(status_code=409, detail="Email already on waitlist")
        
        print(f"Waitlist join error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/waitlist/stats", response_model=WaitlistStats)
async def get_waitlist_stats():
    """Get waitlist statistics"""
    try:
        # Get total count
        total_result = supabase.table('waitlist').select('*', count='exact').execute()
        total_count = total_result.count or 0

        # Get recent signups (last 7 days)
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        recent_result = supabase.table('waitlist').select('*', count='exact').gte('created_at', seven_days_ago).execute()
        recent_count = recent_result.count or 0

        # Get status breakdown
        status_result = supabase.table('waitlist').select('status').execute()
        status_counts = {}
        for item in status_result.data:
            status = item.get('status', 'pending')
            status_counts[status] = status_counts.get(status, 0) + 1

        # Get referral sources
        referral_result = supabase.table('waitlist').select('referral_source').execute()
        referral_counts = {}
        for item in referral_result.data:
            source = item.get('referral_source') or 'Unknown'
            referral_counts[source] = referral_counts.get(source, 0) + 1

        # Sort and get top 5 referral sources
        top_referrals = sorted(
            [{'source': k, 'count': v} for k, v in referral_counts.items()],
            key=lambda x: x['count'],
            reverse=True
        )[:5]

        # Calculate growth rate (simplified)
        growth_rate = (recent_count / max(total_count - recent_count, 1)) * 100

        return WaitlistStats(
            total=total_count,
            recent=recent_count,
            by_status=status_counts,
            top_referral_sources=top_referrals,
            growth_rate=round(growth_rate, 2)
        )

    except Exception as e:
        print(f"Stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")

@app.get("/waitlist/position/{email}")
async def get_waitlist_position(email: str):
    """Get user's position in waitlist"""
    try:
        result = supabase.table('waitlist').select('position, created_at').eq('email', email).single().execute()
        
        if result.data:
            return {
                "email": email,
                "position": result.data.get('position'),
                "joined_at": result.data.get('created_at'),
                "status": "found"
            }
        else:
            raise HTTPException(status_code=404, detail="Email not found in waitlist")

    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Email not found in waitlist")
        
        print(f"Position lookup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to lookup position")

@app.post("/waitlist/invite/{email}")
async def invite_user(email: str, background_tasks: BackgroundTasks):
    """Invite user from waitlist (admin function)"""
    try:
        # Update status to invited
        result = supabase.table('waitlist').update({
            'status': 'invited',
            'invited_at': datetime.utcnow().isoformat()
        }).eq('email', email).execute()

        if result.data:
            # Send invitation email in background
            background_tasks.add_task(send_invitation_email, email)
            
            return {
                "success": True,
                "message": f"Invitation sent to {email}",
                "email": email
            }
        else:
            raise HTTPException(status_code=404, detail="Email not found in waitlist")

    except Exception as e:
        print(f"Invitation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send invitation")

async def send_invitation_email(email: str):
    """Send invitation email to waitlist member"""
    try:
        # Get user details
        result = supabase.table('waitlist').select('first_name').eq('email', email).single().execute()
        first_name = result.data.get('first_name', 'there') if result.data else 'there'

        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print(f"Email not configured, would send invitation to {email}")
            return

        # Create invitation email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"You're invited to AI Nexus, {first_name}!"
        msg['From'] = FROM_EMAIL
        msg['To'] = email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You're Invited to AI Nexus!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #10b981); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">AI Nexus is now available</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #333; margin-bottom: 15px;">Hi {first_name},</h3>
                <p>The wait is over! AI Nexus is now live and you have exclusive early access.</p>
                <p>As one of our early supporters, you get:</p>
                <ul style="padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Free access to premium AI models for 30 days</li>
                    <li style="margin-bottom: 10px;">Priority support and community access</li>
                    <li style="margin-bottom: 10px;">Exclusive features not available to the public</li>
                    <li style="margin-bottom: 10px;">Early access to new AI models and tools</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://ainexus.com/register?token=early_access" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">Get Started Now</a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #666;"><strong>Note:</strong> This invitation expires in 7 days. Don't miss out on your early access!</p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                <p>AI Nexus - The Decentralized AI Marketplace</p>
                <p>
                    <a href="https://ainexus.com" style="color: #22c55e;">Visit our website</a> | 
                    <a href="mailto:support@ainexus.com" style="color: #22c55e;">Contact support</a>
                </p>
            </div>
        </body>
        </html>
        """

        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"Invitation email sent to {email}")

    except Exception as e:
        print(f"Failed to send invitation email to {email}: {str(e)}")

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "running",
            "database": "connected",
            "email": "configured" if SMTP_USERNAME else "not_configured"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "waitlist_service:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )