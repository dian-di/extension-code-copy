const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect'
const GA_DEBUG_ENDPOINT = 'https://www.google-analytics.com/debug/mp/collect'

// Get via https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports
// 请替换为你的 Google Analytics Measurement ID 和 API Secret
const MEASUREMENT_ID = '<measurement_id>'
const API_SECRET = '<api_secret>'
const DEFAULT_ENGAGEMENT_TIME_MSEC = 100

// Duration of inactivity after which a new session is created
const SESSION_EXPIRATION_IN_MIN = 30

interface EventParams {
  [key: string]: string | number | boolean | undefined
  session_id?: string
  engagement_time_msec?: number
}

class Analytics {
  private debug: boolean

  constructor(debug = false) {
    this.debug = debug
  }

  // Returns the client id, or creates a new one if one doesn't exist.
  // Stores client id in local storage to keep the same client id as long as
  // the extension is installed.
  async getOrCreateClientId(): Promise<string> {
    const { clientId } = await chrome.storage.local.get('clientId')
    if (!clientId) {
      // Generate a unique client ID, the actual value is not relevant
      const newClientId = crypto.randomUUID()
      await chrome.storage.local.set({ clientId: newClientId })
      return newClientId
    }
    return clientId as string
  }

  // Returns the current session id, or creates a new one if one doesn't exist or
  // the previous one has expired.
  async getOrCreateSessionId(): Promise<string> {
    // Use storage.session because it is only in memory
    let { sessionData } = await chrome.storage.session.get('sessionData')
    const currentTimeInMs = Date.now()
    // Ensure sessionData is an object and has a timestamp property
    if (sessionData && typeof sessionData === 'object' && 'timestamp' in sessionData && typeof sessionData.timestamp === 'string') {
      // Calculate how long ago the session was last updated
      const durationInMin = (currentTimeInMs - Number(sessionData.timestamp)) / 60000
      // Check if last update lays past the session expiration threshold
      if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
        // Clear old session id to start a new session
        sessionData = null
      } else {
        // Update timestamp to keep session alive
        sessionData.timestamp = currentTimeInMs.toString()
        await chrome.storage.session.set({ sessionData })
      }
    }
    if (!sessionData) {
      // Create and store a new session
      sessionData = {
        session_id: currentTimeInMs.toString(),
        timestamp: currentTimeInMs.toString(),
      }
      await chrome.storage.session.set({ sessionData })
    }

    if (
      !sessionData ||
      typeof sessionData !== 'object' ||
      !('session_id' in sessionData) ||
      typeof (sessionData as any).session_id !== 'string'
    ) {
      throw new Error('sessionData is not of expected type after setting')
    }
    return sessionData.session_id as string
  }

  // Fires an event with optional params. Event names must only include letters and underscores.
  async fireEvent(name: string, params: EventParams = {}): Promise<void> {
    // Configure session id and engagement time if not present, for more details see:
    // https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports
    if (!params.session_id) {
      params.session_id = await this.getOrCreateSessionId()
    }
    if (!params.engagement_time_msec) {
      params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_MSEC
    }

    // 如果 MEASUREMENT_ID 或 API_SECRET 未配置，则不发送事件
    if (MEASUREMENT_ID === '<measurement_id>' || API_SECRET === '<api_secret>') {
      if (this.debug) {
        console.warn('Google Analytics not configured. Please set MEASUREMENT_ID and API_SECRET in lib/analytics.ts')
      }
      return
    }

    try {
      const response = await fetch(
        `${
          this.debug ? GA_DEBUG_ENDPOINT : GA_ENDPOINT
        }?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
        {
          method: 'POST',
          body: JSON.stringify({
            client_id: await this.getOrCreateClientId(),
            events: [
              {
                name,
                params,
              },
            ],
          }),
        },
      )
      if (!this.debug) {
        return
      }
      console.log(await response.text())
    } catch (e) {
      console.error('Google Analytics request failed with an exception', e)
    }
  }

  // Fire a page view event.
  async firePageViewEvent(pageTitle: string, pageLocation: string, additionalParams: EventParams = {}): Promise<void> {
    return this.fireEvent('page_view', {
      page_title: pageTitle,
      page_location: pageLocation,
      ...additionalParams,
    })
  }

  // Fire an error event.
  async fireErrorEvent(error: EventParams, additionalParams: EventParams = {}): Promise<void> {
    // Note: 'error' is a reserved event name and cannot be used
    // see https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag#reserved_names
    return this.fireEvent('extension_error', {
      ...error,
      ...additionalParams,
    })
  }

  // 追踪用户点击功能
  async trackClick(action: string, pageUrl?: string, additionalParams: EventParams = {}): Promise<void> {
    return this.fireEvent('extension_click', {
      action,
      page_url: pageUrl || '',
      ...additionalParams,
    })
  }

  // 追踪复制操作
  async trackCopy(copyType: 'single' | 'multiple', pageUrl?: string, codeLength?: number): Promise<void> {
    return this.fireEvent('extension_copy', {
      copy_type: copyType,
      page_url: pageUrl || '',
      code_length: codeLength || 0,
    })
  }

  // 追踪滚动到元素
  async trackScrollToElement(pageUrl?: string, elementId?: string): Promise<void> {
    return this.fireEvent('extension_scroll_to_element', {
      page_url: pageUrl || '',
      element_id: elementId || '',
    })
  }
}

// 在开发环境下启用 debug 模式
const isDev = process.env.NODE_ENV === 'development'
export default new Analytics(isDev)

