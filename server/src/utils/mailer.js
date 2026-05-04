import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send a notification email to the admin when a new inquiry arrives.
 */
export async function sendInquiryNotification(inquiry) {
  // If SMTP is not configured, skip silently
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_gmail@gmail.com') {
    console.log('[Email] SMTP not configured — skipping email notification.');
    return;
  }

  const transporter = createTransport();

  const subServices = inquiry.sub_services
    ? JSON.parse(inquiry.sub_services).join(', ')
    : 'None';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #00b37a, #0066cc); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">📩 New Inquiry — Hexagon</h1>
      </div>

      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <tr style="background: #f1f5f9;">
          <td style="padding: 12px 16px; font-weight: bold; width: 40%;">Full Name</td>
          <td style="padding: 12px 16px;">${inquiry.first_name} ${inquiry.last_name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: bold; background: #f8fafc;">Email</td>
          <td style="padding: 12px 16px;">${inquiry.email}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td style="padding: 12px 16px; font-weight: bold;">Phone</td>
          <td style="padding: 12px 16px;">${inquiry.phone}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: bold; background: #f8fafc;">Company</td>
          <td style="padding: 12px 16px;">${inquiry.company || '—'}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td style="padding: 12px 16px; font-weight: bold;">Location</td>
          <td style="padding: 12px 16px;">${inquiry.location || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: bold; background: #f8fafc;">Service</td>
          <td style="padding: 12px 16px;">${inquiry.service}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td style="padding: 12px 16px; font-weight: bold;">Sub-Services</td>
          <td style="padding: 12px 16px;">${subServices}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: bold; background: #f8fafc; vertical-align: top;">Message</td>
          <td style="padding: 12px 16px;">${inquiry.message || '—'}</td>
        </tr>
      </table>

      <p style="color: #64748b; font-size: 13px; margin-top: 20px; text-align: center;">
        Received on ${new Date().toLocaleString('en-ET', { timeZone: 'Africa/Addis_Ababa' })} (EAT) · Hexagon Computer Systems
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Hexagon Website" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
    subject: `New Inquiry: ${inquiry.service} — ${inquiry.first_name} ${inquiry.last_name}`,
    html,
  });

  console.log('[Email] Notification sent for inquiry from:', inquiry.email);
}

/**
 * Send a confirmation email to the client.
 */
export async function sendClientConfirmation(inquiry) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_gmail@gmail.com') return;

  const transporter = createTransport();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #00b37a, #0066cc); padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Thank You, ${inquiry.first_name}!</h1>
      </div>
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        We have received your inquiry regarding <strong>${inquiry.service}</strong> and our team will get back to you within <strong>24 business hours</strong>.
      </p>
      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        If you have an urgent request, feel free to reach us directly:
      </p>
      <ul style="color: #374151; line-height: 2;">
        <li>📞 <strong>Phone:</strong> +251-944-161-572</li>
        <li>📧 <strong>Email:</strong> info@hexagonview.com</li>
        <li>📍 <strong>Address:</strong> 22 Mazoriya, MAF Building, 4th FL, #402, Addis Ababa</li>
      </ul>
      <p style="color: #64748b; font-size: 13px; margin-top: 24px; text-align: center;">
        Hexagon Computer Systems · Addis Ababa, Ethiopia
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Hexagon Computer Systems" <${process.env.SMTP_USER}>`,
    to: inquiry.email,
    subject: 'We received your inquiry — Hexagon Computer Systems',
    html,
  });
}
export async function sendPasswordResetEmail(email, pin) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_gmail@gmail.com') return;

  const transporter = createTransport();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
      <div style="background: #111827; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🔒 Password Reset Request</h1>
      </div>
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        You requested to reset your admin password for Hexagon Computer Systems. Use the security PIN below to proceed:
      </p>
      <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px dashed #e5e7eb;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${pin}</span>
      </div>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        This PIN is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email or contact the system administrator.
      </p>
      <p style="color: #64748b; font-size: 13px; margin-top: 24px; text-align: center;">
        Hexagon Computer Systems · Addis Ababa, Ethiopia
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Hexagon Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Hexagon Admin — Password Reset PIN',
    html,
  });
}

/**
 * Send a notification to the client and admin when an inquiry status changes (e.g., Accepted).
 */
export async function sendInquiryStatusUpdate(inquiry, status) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_gmail@gmail.com') return;

  const transporter = createTransport();
  
  // Custom message based on status
  let statusTitle = `Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  let statusMessage = `Your inquiry status has been updated to: <strong>${status}</strong>.`;
  
  if (status === 'accepted') {
    statusTitle = 'Inquiry Accepted! 🎉';
    statusMessage = `Great news! Your inquiry regarding <strong>${inquiry.service}</strong> has been <strong>Accepted</strong>. Our team is now reviewing the details and will reach out to you shortly to discuss the next steps.`;
  } else if (status === 'in progress') {
    statusTitle = 'Work in Progress ⚙️';
    statusMessage = `We are currently working on your request for <strong>${inquiry.service}</strong>. Our team is making progress and we will keep you updated.`;
  } else if (status === 'working') {
    statusTitle = 'Task Started 🛠️';
    statusMessage = `Our technical team has started working on your inquiry regarding <strong>${inquiry.service}</strong>. We are dedicated to providing you with the best solution.`;
  } else if (status === 'finished') {
    statusTitle = 'Project Completed! ✅';
    statusMessage = `We are happy to inform you that your request for <strong>${inquiry.service}</strong> has been marked as <strong>Finished</strong>. We hope you are satisfied with our service!`;
  } else if (status === 'archived') {
    statusTitle = 'Inquiry Archived 📁';
    statusMessage = `Your inquiry regarding <strong>${inquiry.service}</strong> has been archived for our records. If you need further assistance, please feel free to contact us.`;
  } else if (status === 'deleted') {
    statusTitle = 'Inquiry Canceled ❌';
    statusMessage = `Your inquiry regarding <strong>${inquiry.service}</strong> has been canceled or moved to trash. If this was a mistake, please reach out to us.`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #0066cc, #00b37a); padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">${statusTitle}</h1>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Hello ${inquiry.first_name},
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        ${statusMessage}
      </p>

      <div style="background: white; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e5e7eb;">
        <h3 style="margin-top: 0; color: #111827;">Inquiry Details:</h3>
        <p style="margin: 4px 0;"><strong>Service:</strong> ${inquiry.service}</p>
        <p style="margin: 4px 0;"><strong>Reference ID:</strong> REQ_${String(inquiry.id).padStart(3, '0')}</p>
      </div>

      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        If you have any questions, feel free to reply to this email or contact us:
      </p>
      <ul style="color: #374151; line-height: 2;">
        <li>📞 <strong>Phone:</strong> +251-944-161-572</li>
        <li>📧 <strong>Email:</strong> info@hexagonview.com</li>
      </ul>
      
      <p style="color: #64748b; font-size: 13px; margin-top: 24px; text-align: center;">
        Hexagon Computer Systems · Addis Ababa, Ethiopia
      </p>
    </div>
  `;

  // 1. Send to Client
  await transporter.sendMail({
    from: `"Hexagon Computer Systems" <${process.env.SMTP_USER}>`,
    to: inquiry.email,
    subject: `Update on your inquiry: ${statusTitle} — Hexagon`,
    html,
  });

  // 2. Send copy/notification to Admin (as requested)
  await transporter.sendMail({
    from: `"Hexagon System" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
    subject: `[ADMIN NOTIFY] Inquiry #${inquiry.id} status changed to ${status}`,
    html: `
      <h2>Admin Notification</h2>
      <p>The status of inquiry <strong>#${inquiry.id}</strong> from <strong>${inquiry.first_name} ${inquiry.last_name}</strong> has been updated to <strong>${status}</strong>.</p>
      <p>The client has been notified via email (${inquiry.email}).</p>
      <hr/>
      ${html}
    `,
  });

  console.log(`[Email] Status update (${status}) sent to client and admin for inquiry #${inquiry.id}`);
}

/**
 * Send a temporary password email to a team member.
 */
export async function sendTemporaryPasswordEmail(email, name, password) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_gmail@gmail.com') return;

  const transporter = createTransport();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #00b37a, #009966); padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Welcome to Hexagon Admin Panel, ${name}!</h1>
      </div>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        You have been granted administrative access to the Hexagon Computer Systems portal.
      </p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Your temporary login credentials:</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 18px; color: #111827;">${password}</span></p>
      </div>

      <p style="font-size: 14px; color: #ef4444; font-weight: 600; padding: 12px; background: rgba(239,68,68,0.05); border-radius: 8px; border: 1px solid rgba(239,68,68,0.2);">
        ⚠️ SECURITY NOTICE: This temporary password will expire in 10 minutes. You must log in and change your password immediately.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="display: inline-block; background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">Login to Admin Portal</a>
      </div>
      
      <p style="color: #64748b; font-size: 13px; margin-top: 32px; text-align: center;">
        Hexagon Computer Systems · Addis Ababa, Ethiopia
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Hexagon Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Hexagon Admin Access — Temporary Password',
    html,
  });

  console.log('[Email] Temporary password sent to:', email);
}
