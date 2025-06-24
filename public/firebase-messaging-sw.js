// Import the Firebase app and messaging modules
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Use the same Firebase config as /lib/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBBPrLjqCs_j9npf63VGXnwA9VaE6g67pY",
  authDomain: "dh-cloud-messaging.firebaseapp.com",
  projectId: "dh-cloud-messaging",
  storageBucket: "dh-cloud-messaging.firebasestorage.app",
  messagingSenderId: "866343095060",
  appId: "1:866343095060:web:c144ddd26a621eac821001",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

self.addEventListener('notificationclick', (event) => {
  // Get the URL from the notification's data payload
  // If no URL is present, default to the root page '/'
  const targetUrl = event.notification.data?.url || '/';

  // Close the notification pop-up
  event.notification.close();

  // Use waitUntil to ensure the browser doesn't terminate the
  // service worker before the new window/tab has been opened.
  event.waitUntil(
    // clients.openWindow() is the key function that opens your app.
    // It will focus an existing tab if one for that URL already exists.
    clients.openWindow(targetUrl)
  );
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192x192.png", // Optional: an icon to display
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});