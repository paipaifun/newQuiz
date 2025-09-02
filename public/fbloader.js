window.global ||= window
window._onProgress = true
async function updateProgress() {
  let progress = 1
  while (progress < 100) {
    if (window._onProgress === false) {
      progress = 100
      FBInstant.setLoadingProgress(progress)
    } else {
      progress += Math.ceil(10 * Math.random())
      FBInstant.setLoadingProgress(Math.min(progress, 100))
      await new Promise((res) => setTimeout(res, 200))
    }
  }
}
updateProgress()

window.FBInstantPromise = FBInstant.initializeAsync()
window.gameStartPromise = window.FBInstantPromise.then(() => {
  return FBInstant.startGameAsync()
})
window.onFBInstantInited = () => window.FBInstantPromise
window.onFBGameStarted = () => window.gameStartPromise