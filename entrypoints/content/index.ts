import { getEle, $$, uuid, scrollAndBlink } from "@/lib";
import { handlerParams, initEventHandler  } from "@/lib/extension-action";
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
    const codeDom = await waitForElement<HTMLDivElement>(selector)
    if (!codeDom) return
    // 等待cm editor初始化，否则无法正常获取元素和code数据
    if (pathName === 'mozilla.org') {
      await delay(1000)
    }
    const codeEleList = $$(selector).filter(item => !isElementHidden(item))
    let marked = false
    const codeList: SourceCode[] = codeEleList.map((item) => {
      return {
        id: '0',
        code: rule.codeParse(item) || '',
        language: rule.langParse(item) || '',
      }
    })

    const contentReq = {
      'get-code-list': getCodeList,
      'scroll-to-element': scrollToElement
    }

    function getCodeList(params: handlerParams) {
      const { sendResponse } = params
      if (!marked) {
        codeEleList.forEach((item, index) => {
          const id = uuid()
          item.setAttribute('cc-id', id)
          codeList[index].id = id
        })
        marked = true
      }
      sendResponse(codeList)
    }

    function scrollToElement(params: handlerParams) {
      const { data } = params
      if (!data || typeof data !== 'object' || !('id' in data)) return
      const id = (data as { id: string }).id
      const attr = `[cc-id="${id}"]`
      const target = getEle(attr) as HTMLElement
      if (!target) return
      // let finalTarget = target.closest('pre') as HTMLElement
      // if (finalTarget.classList.contains('enlighter-origin')) {
      //   finalTarget = finalTarget.previousElementSibling as HTMLElement
      // }
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
  return !el .offsetWidth && !el.offsetHeight;
}
