'use client';

import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { app } from '@/lib/firebase';

export default function FirebaseMessagingSetup() {
  useEffect(() => {
    // This effect will run on the client side
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messagingInstance = getMessaging(app);
      
      // Request permission and get token
      const requestPermission = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted.');
            const currentToken = await getToken(messagingInstance, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            
            if (currentToken) {
              console.log('FCM Token:', currentToken);
              // IMPORTANT!! Eventually, we would need to send this token to the database
              // to associate it with the user for push notifications. We should remove this console log.
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          } else {
            console.log('Unable to get permission to notify.');
          }
        } catch (err) {
          console.log('An error occurred while retrieving token. ', err);
        }
      };

      requestPermission();
    }
  }, []);

  return null; // This component doesn't render anything
}