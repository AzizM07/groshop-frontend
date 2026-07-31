importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'À_REMPLIR',
  authDomain: 'À_REMPLIR',
  projectId: 'À_REMPLIR',
  messagingSenderId: 'À_REMPLIR',
  appId: 'À_REMPLIR',
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