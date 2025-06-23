// Email service configuration and utilities
export interface EmailConfig {
  service: 'sendgrid' | 'mailgun' | 'resend' | 'smtp';
  apiKey?: string;
  domain?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      switch (this.config.service) {
        case 'sendgrid':
          return await this.sendWithSendGrid(template);
        case 'mailgun':
          return await this.sendWithMailgun(template);
        case 'resend':
          return await this.sendWithResend(template);
        case 'smtp':
          return await this.sendWithSMTP(template);
        default:
          throw new Error(`Unsupported email service: ${this.config.service}`);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private async sendWithSendGrid(template: EmailTemplate): Promise<boolean> {
    // SendGrid implementation
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: template.to }],
          subject: template.subject,
        }],
        from: { email: template.from },
        content: [{
          type: 'text/html',
          value: template.html,
        }],
      }),
    });

    return response.ok;
  }

  private async sendWithMailgun(template: EmailTemplate): Promise<boolean> {
    // Mailgun implementation
    const formData = new FormData();
    formData.append('from', template.from);
    formData.append('to', template.to);
    formData.append('subject', template.subject);
    formData.append('html', template.html);

    const response = await fetch(`https://api.mailgun.net/v3/${this.config.domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`,
      },
      body: formData,
    });

    return response.ok;
  }

  private async sendWithResend(template: EmailTemplate): Promise<boolean> {
    // Resend implementation
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: template.from,
        to: [template.to],
        subject: template.subject,
        html: template.html,
      }),
    });

    return response.ok;
  }

  private async sendWithSMTP(template: EmailTemplate): Promise<boolean> {
    // SMTP implementation would require server-side code
    // For client-side, we'll just log and return true for development
    console.log('SMTP Email (Development):', {
      to: template.to,
      subject: template.subject,
      from: template.from,
    });
    return true;
  }
}

// Factory function to create email service based on environment
export function createEmailService(): EmailService {
  const service = process.env.EMAIL_SERVICE || 'smtp';
  
  const configs: Record<string, EmailConfig> = {
    sendgrid: {
      service: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
    },
    mailgun: {
      service: 'mailgun',
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
    resend: {
      service: 'resend',
      apiKey: process.env.RESEND_API_KEY,
    },
    smtp: {
      service: 'smtp',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
  };

  return new EmailService(configs[service] || configs.smtp);
}