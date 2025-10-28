import { getEle, $$, uuid, scrollAndBlink } from "@/lib";
import { handlerParams, initEventHandler } from "@/lib/extension-action";
import type { SourceCode } from '@/lib/types'
import './content.css'
import { rules } from "./const";

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const pathName = getPathName()
    const rule = rules[pathName] || rules.default
    const selector = rule.selectorList.join(',')

    const contentReq = {
      'get-code-list': getCodeList,
      'scroll-to-element': scrollToElement
    }

    function getCodeList(params: handlerParams) {
      const { sendResponse } = params
      const codeEleList = $$(selector).filter(item => !isElementHidden(item))
      let codeList: SourceCode[] = []
      codeEleList.forEach((item) => {
        const id = uuid()
        item.setAttribute('cc-id', id)
        codeList.push({
          id,
          code: rule.codeParse(item)?.trim() || '',
          language: rule.langParse(item) || '',
        })
      })
      sendResponse(codeList)
    }

    function scrollToElement(params: handlerParams) {
      const { data } = params
      if (!data || typeof data !== 'object' || !('id' in data)) return
      const id = (data as { id: string }).id
      const attr = `[cc-id="${id}"]`
      const target = getEle(attr) as HTMLElement
      if (!target) return
      scrollAndBlink(target)
    }

    initEventHandler(contentReq)
  },
})

function getPathName() {
  return location.hostname.split('.').slice(-2).join('.')
}

function isElementHidden(el: HTMLElement) {
  return !el.offsetWidth && !el.offsetHeight;
}
