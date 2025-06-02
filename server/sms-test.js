import nodemailer from "nodemailer";

// Updated prefix-to-carrier map with '0962' added for Globe
const prefixCarrierMap = {
  globe: [
    '0905', '0906', '0915', '0916', '0917', '0926', '0927',
    '0935', '0936', '0945', '0955', '0956', '0962', '0965', '0966',
    '0975', '0977', '0978', '0994',
  ],
  smart: [
    '0907', '0908', '0909', '0910', '0911', '0912', '0913',
    '0914', '0920', '0921', '0928', '0930', '0938', '0946',
    '0947', '0998', '0950',
  ],
  sun: [
    '0929', '0939', '0949',
  ],
};

// Carrier email gateways
const carrierGatewayMap = {
  globe: 'sms.globe.com.ph',
  smart: 'txt.ph.smart.com',
  sun: 'sms.sun.ph',
};

function getCarrier(phone) {
  // Clean phone number (remove +63, spaces, dashes)
  let cleaned = phone.replace(/\+63/, '0').replace(/\D/g, '');
  let prefix = cleaned.substring(0, 4);

  for (const [carrier, prefixes] of Object.entries(prefixCarrierMap)) {
    if (prefixes.includes(prefix)) {
      return carrier;
    }
  }
  return null;
}

async function sendSmsViaEmail(phone, message) {
  const carrier = getCarrier(phone);
  if (!carrier) {
    console.error('Carrier not found for phone:', phone);
    return;
  }

  const gatewayDomain = carrierGatewayMap[carrier];
  if (!gatewayDomain) {
    console.error('No email gateway for carrier:', carrier);
    return;
  }

  const emailAddress = `${phone}@${gatewayDomain}`;

  let transporter = nodemailer.createTransport({
    service: 'gmail', // You can switch to another SMTP provider if you want
    auth: {
      user: 'sjmajore@gmail.com',
      pass: 'snmb nlru pdtb erwn',               // <-- Replace with your Gmail App Password
    },
    tls: {
      rejectUnauthorized: false,               // Workaround for TLS errors (local/dev use only)
    },
  });

  const mailOptions = {
    from: 'sjmajore@gmail.com',              // <-- Same as above
    to: emailAddress,
    subject: '',                               // Leave empty for SMS gateways
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`SMS sent to ${phone} via ${carrier} gateway`);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}

// Usage
sendSmsViaEmail('09506067591', 'Hello! This is a test SMS sent via email-to-SMS gateway.');
