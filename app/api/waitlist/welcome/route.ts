import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, position } = await request.json();

    // In a real implementation, you would integrate with an email service
    // like SendGrid, Mailgun, or AWS SES
    
    // For now, we'll just log the welcome email details
    console.log('Sending welcome email:', {
      to: email,
      firstName,
      position,
      subject: 'Welcome to AI Nexus Waitlist!',
      template: 'waitlist-welcome'
    });

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));

    // Here you would typically call your email service:
    /*
    await emailService.send({
      to: email,
      subject: `Welcome to AI Nexus, ${firstName}! You're #${position} in line`,
      template: 'waitlist-welcome',
      data: {
        firstName,
        position,
        waitlistUrl: `${process.env.NEXT_PUBLIC_APP_URL}/waitlist`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${email}`
      }
    });
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    });

  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}