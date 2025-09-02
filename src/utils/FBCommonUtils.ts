import { log } from './firebase/firebase'

export const subscribeGame = async (): Promise<boolean> => {
  const subscribeBot = localStorage.getItem('subscribe_bot') ?? 'false'
  if (subscribeBot === 'true') {
    return false
  }
  try {
    await window.onFBGameStarted()
    const canSubscribe = await window.FBInstant.player.canSubscribeBotAsync()
    if (!canSubscribe) {
      log('mess_fail')
      return false
    }
    log('mess_authorize')
    let subscribeResult = await window.FBInstant.player.subscribeBotAsync()
    localStorage.setItem('subscribe_bot', 'true')
    log('mess_authorize_c')
    console.log('subscribeBotAsync: ' + JSON.stringify(subscribeResult))
    return true
  } catch (e) {
    log('mess_authorize_l')
    console.log('canSubscribeGame: ' + JSON.stringify(e))
    return false
  }
}

export const shortcutGame = async (): Promise<void> => {
  const createShortcut = localStorage.getItem('create_shortcut') ?? 'false'
  if (createShortcut === 'true') {
    let subscribeResult = await subscribeGame()
    console.log('subscribeResult: ' + subscribeResult)
    return
  }
  try {
    await window.onFBGameStarted()
    const canCreateShortcut = await window.FBInstant.canCreateShortcutAsync()
    console.log('sc canCreateShortcut: ' + canCreateShortcut)
    if (!canCreateShortcut) {
      log('sc_fail')
      let subscribeResult = await subscribeGame()
      console.log('subscribeResult: ' + subscribeResult)
      return
    }
    log('sc_authorize')
    let shortcutResult = await window.FBInstant.createShortcutAsync()
    localStorage.setItem('create_shortcut', 'true')
    console.log('create shortcut result: ' + shortcutResult)
    log('sc_authorize_c')
    let subscribeResult = await subscribeGame()
    console.log('subscribeResult: ' + subscribeResult)
  } catch (e) {
    console.log('create shortcut error: ' + JSON.stringify(e))
    let subscribeResult = await subscribeGame()
    console.log('subscribeResult: ' + subscribeResult)
  }
}
