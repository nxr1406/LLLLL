import admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace literal \n with actual newlines for the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, title, body, data } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields: token, title, body' });
    }

    const message = {
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          sound: 'default',
          clickAction: 'FCM_PLUGIN_ACTIVITY',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      data: data || {},
      token,
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
}
