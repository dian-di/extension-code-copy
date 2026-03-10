import { type handlerParams, initEventHandler, getActiveTabUrl } from '@/lib/extension-action'
import { browser } from 'wxt/browser'
import analytics from '@/lib/analytics'

export default defineBackground(() => {
  const contentReq = {
    'get-active-tab': getActiveTab,
  }

  function getActiveTab(params: handlerParams) {
    const { sendResponse } = params
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0]
        sendResponse(tab)
      }
    })
  }

  initEventHandler(contentReq)
  const tabSet = new Set()
  // 点击图标打开
  browser.action.onClicked.addListener(async (tab) => {
    const tabId = tab.id as number
    tabSet.add(tabId)
    
    // 追踪图标点击事件，记录当前页面链接
    const pageUrl = tab.url || ''
    await analytics.trackClick('icon_click', pageUrl, {
      tab_id: tabId,
    })
    
    chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true,
    })
    chrome.sidePanel.open({
      tabId: tab.id as number,
    })
  })

  browser.tabs.onActivated.addListener(async (activeInfo: { tabId: number }) => {
    const { tabId } = activeInfo
    disablePanel(tabId)
    
    // 追踪标签页切换
    try {
      const tab = await browser.tabs.get(tabId)
      if (tab.url) {
        await analytics.trackClick('tab_activated', tab.url, {
          tab_id: tabId,
        })
      }
    } catch (error) {
      // 忽略错误，可能标签页已关闭
    }
  })

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    disablePanel(tabId)
    
    // 追踪页面更新（URL 变化）
    if (changeInfo.url && tab.url) {
      await analytics.trackClick('page_updated', tab.url, {
        tab_id: tabId,
        status: changeInfo.status || 'unknown',
      })
    }
  })

  function disablePanel(tabId: number) {
    if (!tabSet.has(tabId)) {
      chrome.sidePanel.setOptions({
        enabled: false,
      })
    }
  }

  browser.tabs.onRemoved.addListener(async (tabId) => {
    tabSet.delete(tabId)
  })
})
