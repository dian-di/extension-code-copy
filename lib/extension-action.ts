import { browser } from 'wxt/browser'

type GreetingType = 'get-active-tab' | 'get-code-list' | 'scroll-to-element'

export type BrowserRequest = {
  greeting: GreetingType
  data?: object | any[]
}

export type handlerParams = {
  data: BrowserRequest['data']
  sendResponse: (message: unknown) => void
  tabId?: number
}

export type BrowserHandler = Record<GreetingType, (params: handlerParams) => void>

export function initEventHandler(contentReq: Partial<BrowserHandler>) {
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const browserRequest = request as BrowserRequest
    const data = browserRequest.data
    const tabId = sender.tab?.id
    const handler = contentReq[browserRequest.greeting]
    if (handler) {
      handler({
        data,
        sendResponse,
        tabId,
      })
    }
    return true
  })
}

export function sendMessageToActiveTab(msg: BrowserRequest) {
  return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0]
      return browser.tabs.sendMessage(tab.id as number, msg)
    }
  })
}

export function sendBrowserMessage(request: BrowserRequest) {
  return browser.runtime.sendMessage(request)
}

// 获取当前活动标签页的 URL
export async function getActiveTabUrl(): Promise<string | undefined> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0 && tabs[0].url) {
      return tabs[0].url
    }
  } catch (error) {
    console.error('Failed to get active tab URL:', error)
  }
  return undefined
}
