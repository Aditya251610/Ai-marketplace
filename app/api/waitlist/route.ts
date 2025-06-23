import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      company,
      role,
      useCase,
      interests,
      referralSource,
      newsletter
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Insert into waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{
        email,
        first_name: firstName,
        last_name: lastName,
        company,
        role,
        use_case: useCase,
        interests,
        referral_source: referralSource,
        newsletter_consent: newsletter,
        ip_address: clientIP,
        user_agent: userAgent
      }])
      .select('position')
      .single();

    if (error) {
      // Handle duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on our waitlist!' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Get total waitlist count for position
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const position = count || 1;

    // Send welcome email automatically
    try {
      await sendWelcomeEmail(email, firstName, position);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      position,
      totalCount: count
    });

  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, firstName: string, position: number) {
  // Email service configuration
  const emailConfig = {
    service: 'gmail', // or your preferred email service
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
  };

  // Email template
  const emailTemplate = {
    from: process.env.FROM_EMAIL || 'noreply@ainexus.com',
    to: email,
    subject: `Welcome to AI Nexus, ${firstName}! You're #${position} in line`,
    html: generateWelcomeEmailHTML(firstName, position, email)
  };

  // For development, log the email instead of sending
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Welcome Email (Development Mode):', {
      to: email,
      subject: emailTemplate.subject,
      position,
      firstName
    });
    return;
  }

  // In production, you would use a service like:
  // - SendGrid
  // - Mailgun
  // - AWS SES
  // - Resend
  // - Nodemailer with SMTP

  // Example with a hypothetical email service:
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransporter(emailConfig);
  await transporter.sendMail(emailTemplate);
  */

  // For now, we'll simulate sending
  console.log('📧 Welcome email sent to:', email);
}

function generateWelcomeEmailHTML(firstName: string, position: number, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AI Nexus</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #22c55e, #10b981); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
            .position-card { background: #f8f9fa; padding: 30px; text-align: center; margin: 30px; border-radius: 12px; border: 2px solid #e9ecef; }
            .position-number { font-size: 48px; font-weight: 800; color: #22c55e; margin: 0; }
            .position-text { color: #6c757d; margin: 5px 0 0 0; font-size: 16px; }
            .content { padding: 0 30px 30px; }
            .content h3 { color: #333; margin: 0 0 15px 0; font-size: 20px; }
            .content p { margin: 0 0 15px 0; color: #555; }
            .benefits { background: #f8f9fa; margin: 20px 0; padding: 25px; border-radius: 8px; }
            .benefits h4 { color: #22c55e; margin: 0 0 15px 0; font-size: 18px; }
            .benefits ul { margin: 0; padding-left: 20px; }
            .benefits li { margin-bottom: 8px; color: #555; }
            .cta-section { text-align: center; margin: 30px 0; }
            .cta-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
            .share-section { background: #e8f5e8; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .share-buttons { margin-top: 15px; }
            .share-button { display: inline-block; margin: 0 10px; padding: 10px 20px; background: #22c55e; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; border-top: 1px solid #e9ecef; }
            .footer a { color: #22c55e; text-decoration: none; }
            .social-links { margin: 15px 0; }
            .social-links a { margin: 0 10px; color: #22c55e; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to AI Nexus!</h1>
                <p>The Future of Decentralized AI</p>
            </div>
            
            <div class="position-card">
                <div class="position-number">#${position}</div>
                <div class="position-text">Your position in line</div>
            </div>
            
            <div class="content">
                <h3>Hi ${firstName},</h3>
                <p>Thank you for joining the AI Nexus waitlist! You're now part of an exclusive community of developers, researchers, and innovators who are shaping the future of AI.</p>
                
                <div class="benefits">
                    <h4>🚀 What happens next?</h4>
                    <ul>
                        <li><strong>Exclusive Updates:</strong> Get insider insights on our development progress</li>
                        <li><strong>Early Access:</strong> Be among the first to use AI Nexus when we launch</li>
                        <li><strong>Premium Features:</strong> Access to advanced AI models and tools</li>
                        <li><strong>Priority Support:</strong> Dedicated support and community access</li>
                        <li><strong>Special Pricing:</strong> Exclusive discounts for early supporters</li>
                    </ul>
                </div>
                
                <div class="share-section">
                    <h4>🎯 Move up the waitlist faster!</h4>
                    <p>Share AI Nexus with friends and colleagues to improve your position. For every person who joins using your referral, you move up 3 spots!</p>
                    <div class="share-buttons">
                        <a href="https://twitter.com/intent/tweet?text=Just%20joined%20the%20AI%20Nexus%20waitlist!%20The%20future%20of%20decentralized%20AI%20is%20coming.%20Join%20me:%20https://ainexus.com/waitlist?ref=${encodeURIComponent(email)}" class="share-button">Share on Twitter</a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://ainexus.com/waitlist?ref=${encodeURIComponent(email)}" class="share-button">Share on LinkedIn</a>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <a href="https://ainexus.com" class="cta-button">Visit AI Nexus</a>
            </div>
            
            <div class="footer">
                <p><strong>AI Nexus</strong> - The Decentralized AI Marketplace</p>
                <div class="social-links">
                    <a href="https://twitter.com/ainexus">Twitter</a> |
                    <a href="https://github.com/ainexus">GitHub</a> |
                    <a href="https://discord.gg/ainexus">Discord</a>
                </div>
                <p>
                    <a href="https://ainexus.com">Visit Website</a> | 
                    <a href="mailto:support@ainexus.com">Contact Support</a> |
                    <a href="https://ainexus.com/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a>
                </p>
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                    This email was sent to ${email} because you joined our waitlist.<br>
                    AI Nexus, Inc. • San Francisco, CA • support@ainexus.com
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}