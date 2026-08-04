importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyA09zawbhPk9VWL_ppHkzZq7Mi3b-W2Tqs',
  authDomain: 'groshop-prod.firebaseapp.com',
  projectId: 'groshop-prod',
  messagingSenderId: '637082904152',
  appId: '1:637082904152:web:054d5804afdb52f27b4c2d',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {}
  const link = (payload.data && payload.data.link) || '/'
  self.registration.showNotification(n.title || 'GROSHOP', {
    body: n.body || '',
    icon: '/icons/icon-192.png',
    image: n.image,
    data: { link },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = (event.notification.data && event.notification.data.link) || '/'
  event.waitUntil(clients.openWindow(link))
})