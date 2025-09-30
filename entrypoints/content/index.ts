import { getEle, $$, uuid, scrollAndBlink } from "@/lib";
import { handlerParams, initEventHandler } from "@/lib/extension-action";
import { waitForElement } from "@/lib/wait-for-selector";
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
      const codeList: SourceCode[] = codeEleList.map((item) => {
        return {
          id: '0',
          code: rule.codeParse(item) || '',
          language: rule.langParse(item) || '',
        }
      })
      codeEleList.forEach((item, index) => {
        const id = uuid()
        item.setAttribute('cc-id', id)
        codeList[index].id = id
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

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isElementHidden(el: HTMLElement) {
  return !el.offsetWidth && !el.offsetHeight;
}
