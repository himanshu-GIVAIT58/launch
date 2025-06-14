import { NextResponse } from 'next/server';

// Example using Resend. You would run `npm install resend`
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, message } = await request.json();

    // --- THIS IS WHERE YOU INTEGRATE YOUR EMAIL SERVICE ---
    // Example:
    // await resend.emails.send({
    //   from: 'LaunchPad <no-reply@yourdomain.com>',
    //   to: to, // Should be the team lead's email
    //   subject: subject,
    //   html: `<p>${message}</p>`,
    // });
    // For now, we'll just simulate a successful response.
    console.log(`Simulating email send to ${to} with subject "${subject}"`);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
  }
}
