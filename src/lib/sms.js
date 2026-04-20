const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'GLDMNE';
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'console'; // console | msg91 | twilio

export async function sendSMS(phone, message) {
  const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

  switch (SMS_PROVIDER) {
    case 'msg91':
      return sendViaMSG91(formattedPhone, message);
    case 'twilio':
      return sendViaTwilio(formattedPhone, message);
    default:
      return sendViaConsole(formattedPhone, message);
  }
}

export async function sendOTP(phone, otp) {
  const message = `Your GoldMine Pro verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
  return sendSMS(phone, message);
}

export async function sendWelcomeSMS(phone, name) {
  const message = `Welcome to GoldMine Pro, ${name}! Start mining gold today. Download our app for the best experience.`;
  return sendSMS(phone, message);
}

export async function sendWithdrawalSMS(phone, amount, status) {
  const message = `GoldMine Pro: Your withdrawal of Rs.${amount} has been ${status}. Check app for details.`;
  return sendSMS(phone, message);
}

// Console (Development)
async function sendViaConsole(phone, message) {
  console.log(`📱 SMS to ${phone}: ${message}`);
  return { success: true, provider: 'console', simulated: true };
}

// MSG91
async function sendViaMSG91(phone, message) {
  try {
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': SMS_API_KEY,
      },
      body: JSON.stringify({
        sender: SMS_SENDER_ID,
        route: '4',
        country: '91',
        sms: [{ message, to: [phone.replace('+91', '')] }],
      }),
    });

    const data = await response.json();
    return { success: data.type === 'success', provider: 'msg91', data };
  } catch (error) {
    console.error('MSG91 error:', error);
    return { success: false, provider: 'msg91', error: error.message };
  }
}

// Twilio
async function sendViaTwilio(phone, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({
          To: phone,
          From: fromPhone,
          Body: message,
        }),
      }
    );

    const data = await response.json();
    return { success: !data.code, provider: 'twilio', sid: data.sid };
  } catch (error) {
    console.error('Twilio error:', error);
    return { success: false, provider: 'twilio', error: error.message };
  }
}

export async function sendP2PMatchAlert(phone, amount) {
  const message = `GoldMine Pro: You have been matched with a subscriber for ₹${amount}. Please check your Withdrawal dashboard for details.`;
  return sendSMS(phone, message);
}

export async function sendP2PPaymentAlert(phone, amount) {
  const message = `GoldMine Pro: A subscriber claims to have paid ₹${amount} into your account. Please verify your bank and confirm receipt in the app.`;
  return sendSMS(phone, message);
}

export async function sendP2PActivationAlert(phone, planName) {
  const message = `GoldMine Pro: Your ${planName} plan has been activated successfully! Happy Mining.`;
  return sendSMS(phone, message);
}

export default { sendSMS, sendOTP, sendWelcomeSMS, sendWithdrawalSMS, sendP2PMatchAlert, sendP2PPaymentAlert, sendP2PActivationAlert };