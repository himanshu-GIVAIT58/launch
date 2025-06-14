import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Define the 'from' address based on the environment
const fromAddress = process.env.NODE_ENV === 'development'
  ? 'onboarding@resend.dev' // Use this for localhost testing
  : 'LaunchPad Alerts <alerts@your-verified-domain.com>'; // Use your verified domain in production

export async function POST(request: Request) {
  try {
    const { to, subject, message } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Determine the recipient ('to') address based on the environment
    const recipient = process.env.NODE_ENV === 'development'
      ? ['himu09854@gmail.com'] // For testing, send only to your verified Resend email
      : [to]; // In production, use the dynamic email from the request

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipient,
      subject: subject,
      html: `<p>${message}</p>`,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ success: false, message: 'Failed to send email', error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully', data });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
  }
}
