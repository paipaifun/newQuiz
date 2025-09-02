// Mock FBInstant SDK for development environment
window.FBInstant = {
  player: {
    getDataAsync: async (keys) => {
      console.log('Mock: getDataAsync', keys)
      const result = {}
      try {
        const storageData = localStorage.getItem('fb_instant_data')
        const data = storageData ? JSON.parse(storageData) : {}

        if (Array.isArray(keys)) {
          keys.forEach((key) => {
            result[key] = data[key]
          })
        } else {
          result[keys] = data[keys]
        }
      } catch (error) {
        console.error('Mock: getDataAsync error', error)
      }
      return result
    },
    setDataAsync: async (data) => {
      console.log('Mock: setDataAsync', data)
      try {
        const storageData = localStorage.getItem('fb_instant_data')
        const existingData = storageData ? JSON.parse(storageData) : {}

        const newData = {
          ...existingData,
          ...data,
        }

        localStorage.setItem('fb_instant_data', JSON.stringify(newData))
        return true
      } catch (error) {
        console.error('Mock: setDataAsync error', error)
        return false
      }
    },
    getID: () => {
      console.log('Mock: getID')
      return localStorage.getItem('fb_player_id')
    },
    getName: () => {
      console.log('Mock: getName')
      return 'Mock Player'
    },
    getPhoto: () => {
      console.log('Mock: getPhoto')
      return 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=122133112082682934&gaming_photo_type=unified_picture&ext=1752135908&hash=AT9QWHKvA6ryEe_knb4icDc7'
    },
    getSignedPlayerInfoAsync: async (data) => {
      console.log('Mock: getSignedPlayerInfoAsync', data)
      try {
        const signature = localStorage.getItem('fb_instant_signature')
        return {
          $1: {
            signature,
          },
        }
      } catch (error) {
        console.error('Mock: getSignedPlayerInfoAsync error', error)
        return {
          $1: {
            signature: localStorage.getItem('fb_instant_signature'),
          },
        }
      }
    },
    canSubscribeBotAsync: async () => {
      console.log('Mock: canSubscribeBotAsync')
      return true
    },
    subscribeBotAsync: async () => {
      console.log('Mock: subscribeBotAsync')
      return true
    },
  },
  initializeAsync: async () => {
    console.log('Mock: initializeAsync')
    return true
  },
  startGameAsync: async () => {
    console.log('Mock: startGameAsync')
    return true
  },
  setLoadingProgress: (progress) => {
    console.log('Mock: setLoadingProgress', progress)
  },
  getPlatform: () => {
    console.log('Mock: getPlatform')
    return 'FACEBOOK'
  },
  getEntryPointAsync: async () => {
    console.log('Mock: getEntryPointAsync')
    return 'MOCK_ENTRY_POINT'
  },
  getEntryPointData: async () => {
    console.log('Mock: getEntryPointData')
    return {}
  },
  shareAsync: async (options) => {
    console.log('Mock: shareAsync', options)
    return true
  },
  canCreateShortcutAsync: async () => {
    console.log('Mock: canCreateShortcutAsync')
    return true
  },
  createShortcutAsync: async () => {
    console.log('Mock: createShortcutAsync')
    return true
  },
  payments: {
    onReady: async (callback) => {
      console.log('Mock: payments.onReady')
      callback({})
    },
    getPurchasesAsync: async () => {
      console.log('Mock: getPurchasesAsync')
      return []
    },
    getCatalogAsync: async () => {
      console.log('Mock: getCatalogAsync')
      return []
    },
    purchaseAsync: async (options) => {
      console.log('Mock: purchaseAsync', options)
      return { purchaseToken: 'mock-token' }
    },
    consumePurchaseAsync: async (purchaseToken) => {
      console.log('Mock: consumePurchaseAsync', purchaseToken)
      return true
    },
  },
  loadBannerAdAsync: async (adId) => {
    console.log('Mock: loadBannerAdAsync', adId)
    return true
  },
  hideBannerAdAsync: async () => {
    console.log('Mock: hideBannerAdAsync')
    return true
  },
  getRewardedInterstitialAsync: async (id) => {
    console.log('Mock: getRewardedInterstitialAsync', id)
    return {
      showAsync: async () => {
        console.log('Mock: showRewardedInterstitial')
        return true
      },
    }
  },
  getInterstitialAdAsync: async (id) => {
    console.log('Mock: getInterstitialAdAsync', id)
    return {
      showAsync: async () => {
        console.log('Mock: showInterstitial')
        return true
      },
    }
  },
  getRewardedVideoAsync: async (id) => {
    console.log('Mock: getRewardedVideoAsync', id)
    return {
      showAsync: async () => {
        console.log('Mock: showRewardedVideo')
        return true
      },
    }
  },
  getLocale: () => {
    console.log('Mock: getLocale')
    return 'pt_BR'
    // return 'en_US'
  },
  logEvent: (name, value, params) => {
    console.log('Mock: logEvent', { name, value, params })
  },
}
