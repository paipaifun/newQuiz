export async function makeImpact() {
  try {
    await FBInstant.performHapticFeedbackAsync();
  } catch (error) {}
}

export async function grantNormalPermission() {
  if (!window.onGameStarted) {
    return;
  }
  await window.onGameStarted();

  const key = "gux_next_request_index";
  const indexStr = window.localStorage.getItem(key) ?? "";
  let index = parseInt(indexStr) || 0;

  async function checkShortcut() {
    try {
      const canShortcut = await FBInstant.canCreateShortcutAsync();
      if (canShortcut) {
        console.log("create shortcut");
        FBInstant.createShortcutAsync();
        return true;
      }
    } catch (error) {
      // console.error(error);
    }
    return false;
  }

  async function checkMessage() {
    try {
      const canSubscribe = await FBInstant.player.canSubscribeBotAsync();
      if (canSubscribe) {
        console.log("subscribe bot");
        FBInstant.player.subscribeBotAsync();
        return true;
      }
    } catch (error) {
      // console.error(error);
    }
    return false;
  }

  const callbackList: (() => Promise<boolean>)[] = [
    checkShortcut,
    checkMessage,
  ];

  let done = false;
  for (let i = 0; i < callbackList.length; i++) {
    const j = (i + index) % callbackList.length;
    console.log("request permission:", j);
    done = await callbackList[j]();
    if (done) {
      let next = (j + 1) % callbackList.length;
      window.localStorage.setItem(key, next.toString());
      return;
    }
  }
}
