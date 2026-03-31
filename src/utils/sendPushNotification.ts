export const sendPushNotification = async (token: string, title: string, body: string, data?: any) => {
  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, title, body, data }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling push notification API:', error);
    return { error };
  }
};
