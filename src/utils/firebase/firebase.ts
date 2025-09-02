import { initializeApp } from 'firebase/app'
import { getAnalytics, logEvent } from 'firebase/analytics'
import { report } from '../flashup'

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: "recorder-pro-50451.firebaseapp.com",
  databaseURL: "https://recorder-pro-50451.firebaseio.com",
  projectId: "recorder-pro-50451",
  storageBucket: "recorder-pro-50451.appspot.com",
  messagingSenderId: "802233935605",
  appId: "1:802233935605:web:d660fc0c55a54101ce07bc",
  measurementId: "G-H4JGH5PR6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

const { FBInstant } = window

// 通过UA判断是 ios 还是 android 或者 web
const ua = navigator.userAgent
let _platform = 'web'

if (/iPhone|iPad|iPod/i.test(ua)) {
  _platform = 'ios'
} else if (/Android/i.test(ua)) {
  _platform = 'android'
}

const isDev = window.location.hostname === 'localhost'
export const log = async (logName: string, data: any = {}) => {
  await window.onFBGameStarted()
  const platform = FBInstant.getPlatform()
  const entryPoint = await FBInstant.getEntryPointAsync()
  const logParams = {
    ...data,
    fbUserID: FBInstant.player.getID(),
    platform: platform || _platform,
    this_from: entryPoint,
  }
  console.info('logEvent:', logName, logParams)
  if (isDev) return
  report(logName, logParams)
  return logEvent(analytics, logName, logParams)
}
