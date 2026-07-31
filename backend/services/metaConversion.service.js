const axios = require('axios');
require('dotenv').config();

/**
 * Sends a server-side event to Meta (Facebook) Conversions API.
 * 
 * @param {string} eventName - Standard Meta Event name (e.g. 'Purchase', 'AddToCart')
 * @param {object} eventData - Custom data for the event (value, currency, etc.)
 * @param {object} userData - User data for matching (email, phone, client_ip, client_user_agent)
 * @param {object} req - Express request object (optional, used to auto-extract IP/Agent if userData is incomplete)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const sendServerEvent = async (eventName, eventData = {}, userData = {}, req = null) => {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken || pixelId === 'YOUR_PIXEL_ID' || accessToken === 'YOUR_META_ACCESS_TOKEN') {
    console.warn('Meta Pixel ID or Access Token is missing or invalid. Skipping Conversions API event.');
    return false;
  }

  // Extract Request Info (IP, User Agent) if available
  let client_ip = userData.client_ip;
  let client_user_agent = userData.client_user_agent;
  let fbp = userData.fbp;
  let fbc = userData.fbc;

  if (req) {
    client_ip = client_ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    client_user_agent = client_user_agent || req.headers['user-agent'];
    
    // Extract cookies for fbp and fbc if present
    if (!fbp && req.cookies && req.cookies['_fbp']) fbp = req.cookies['_fbp'];
    if (!fbc && req.cookies && req.cookies['_fbc']) fbc = req.cookies['_fbc'];
  }

  // Construct Meta CAPI Payload
  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          client_ip,
          client_user_agent,
          fbp,
          fbc,
          // Optional hashing should be done here for em (email), ph (phone) etc. if passed.
          // Expecting userData to pass already hashed arrays, or we can add a hashing util here.
          ...userData.hashed
        },
        custom_data: eventData
      }
    ],
    // Optional: test_event_code: 'TEST2023'
  };

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    await axios.post(url, payload);
    return true;
  } catch (error) {
    // We catch and log errors safely to avoid crashing the server
    console.error(`Meta Conversions API Error [${eventName}]:`, error.response?.data || error.message);
    return false;
  }
};

module.exports = {
  sendServerEvent
};
