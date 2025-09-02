export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getRegionCode() {
  const language = window.navigator.language
  // 将语言代码分割成部分
  const parts = language.split('-')

  if (parts.length > 1) {
    // 如果有多个部分，返回最后一个部分（通常是地区代码）
    return parts[parts.length - 1].toUpperCase()
  } else {
    // 如果只有一个部分，将其作为地区代码返回
    return parts[0].toUpperCase()
  }
}

// 获取今天的起始和结束时间戳（秒级）
export function getTodayTimestamps(): [number, number] {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  return [Math.floor(startOfDay.getTime() / 1000), Math.floor(endOfDay.getTime() / 1000)]
}

// 获取当前周的起始和结束时间戳（秒级）
export function getCurrentWeekTimestamps(): [number, number] {
  const now = new Date()
  const currentDay = now.getDay()
  const diffToMonday = currentDay === 0 ? 6 : currentDay - 1 // 将周日视为一周的最后一天

  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday)
  const endOfWeek = new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 6,
    23,
    59,
    59,
    999
  )

  return [Math.floor(startOfWeek.getTime() / 1000), Math.floor(endOfWeek.getTime() / 1000)]
}

export const handleSignature = async <T extends { signature?: string }>(
  params: T,
  signatrueGetter?: () => Promise<string>
) => {
  const newParams = {
    ...params,
  }
  if (newParams.signature) {
    return newParams
  }
  if (!newParams.signature) {
    if (!signatrueGetter) {
      throw new Error('signatureGetter is not defined and signature is not provided')
    }
    newParams.signature = await signatrueGetter()
  }
  return newParams
}

export function addParamsToUrl(baseUrl: string, params: Object) {
  const url = new URL(baseUrl)
  const searchParams = new URLSearchParams(url.search)

  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, value)
  }

  url.search = searchParams.toString()
  return url.toString()
}

export function isSecondTimestamp(timestamp: number) {
  // 转为数字以确保是数值
  const num = Number(timestamp)

  // 判断是否为有效数字且是 10 位数
  return Number.isInteger(num) && String(Math.abs(num)).length === 10
}
