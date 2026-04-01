// ANM LineeVivo – Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA99hZr8n2jPbmGPKR15Btf1LnfJCRynGk",
  authDomain: "anm-lineevivo.firebaseapp.com",
  databaseURL: "https://anm-lineevivo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "anm-lineevivo",
  storageBucket: "anm-lineevivo.firebasestorage.app",
  messagingSenderId: "224724563682",
  appId: "1:224724563682:web:8771592abdfb4df89c10bb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'ANM LineeVivo', {
    body: body || 'Nuova deviazione segnalata',
    icon: '/ANM-LineeVivo/icons/icon-192.png',
    badge: '/ANM-LineeVivo/icons/icon-72.png',
    tag: 'anm-deviazione',
    renotify: true,
    data: { url: 'https://chicco81.github.io/ANM-LineeVivo/' },
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://chicco81.github.io/ANM-LineeVivo/')
  );
});
