// src/lib/facebookLogin.js — GROSHOP.tn
// Login Facebook en flux CLIENT (SDK popup), comme Google One Tap.
// Aucune navigation vers /callback/ -> plus de page rouge "Site dangereux".

import { auth } from './api'

const FB_APP_ID  = '1613871763594603'   // App ID Facebook (public, comme le client_id Google en dur)
const FB_VERSION = 'v19.0'              // aligne sur le backend

let sdkPromise = null

function loadSdk() {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise((resolve, reject) => {
    if (window.FB) { resolve(window.FB); return }
    if (!FB_APP_ID) { reject(new Error('config')); return }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId:   FB_APP_ID,
        cookie:  true,
        xfbml:   false,
        version: FB_VERSION,
        status:  false,
      })
      resolve(window.FB)
    }

    const ID = 'facebook-jssdk'
    if (!document.getElementById(ID)) {
      const js = document.createElement('script')
      js.id = ID
      js.async = true
      js.defer = true
      js.src = 'https://connect.facebook.net/fr_FR/sdk.js'
      js.onerror = () => reject(new Error('sdk'))
      document.head.appendChild(js)
    }
  })
  return sdkPromise
}

// À appeler au montage de la page (login/signup) pour précharger le SDK,
// afin que FB.login s'ouvre bien dans le geste du clic (sinon popup bloquée).
export function preloadFacebookSdk() {
  loadSdk().catch(() => {})
}

// Récupère un access_token Facebook.
// 1) tente FB.login (ouvre le popup si nécessaire)
// 2) si le callback ne fournit pas de token (conflit avec un autre SDK FB sur
//    la page, ex. Pixel/tracking), relit le statut via FB.getLoginStatus.
function getFacebookToken(FB) {
  return new Promise((resolve, reject) => {
    FB.login((res) => {
      const t = res && res.authResponse && res.authResponse.accessToken
      if (t) { resolve(t); return }

      // Repli : le token n'est pas venu dans le callback -> on relit le statut.
      FB.getLoginStatus((s) => {
        const t2 = s && s.status === 'connected' && s.authResponse && s.authResponse.accessToken
        if (t2) resolve(t2)
        else reject(new Error('cancelled'))
      }, true)  // true = force un refresh du statut (ignore le cache)
    }, { scope: 'email' })
  })
}

// Ouvre le popup Facebook, échange le token contre TA session (cookies JWT),
// et renvoie l'utilisateur. Throw Error('cancelled') si l'utilisateur annule.
export async function facebookSignIn() {
  const FB = window.FB || (await loadSdk())

  const accessToken = await getFacebookToken(FB)

  const data = await auth.facebookToken(accessToken)
  if (!data || !data.user) throw new Error('failed')
  return data.user
}