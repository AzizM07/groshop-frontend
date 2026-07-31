import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

// ⚠️ À remplir depuis la console Firebase → Paramètres du projet → Web app
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
}
const VAPID_KEY = import.meta.env.VITE_FB_VAPID_KEY  // Cloud Messaging → Web Push certificates

let _messaging = null

async function getMsg() {
  if (_messaging) return _messaging
  if (!(await isSupported())) return null
  _messaging = getMessaging(initializeApp(firebaseConfig))
  return _messaging
}

// Demande la permission et renvoie le token FCM (ou null)
export async function requestPushToken() {
  try {
    const m = await getMsg()
    if (!m) return null
    if (Notification.permission === 'denied') return null
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return null
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    return await getToken(m, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg })
  } catch (e) {
    console.warn('FCM token error:', e)
    return null
  }
}

// Notifications reçues quand l'onglet est au premier plan
export async function onForegroundMessage(cb) {
  const m = await getMsg()
  if (m) onMessage(m, cb)
}