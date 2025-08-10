import { getEle, $$, uuid, scrollAndBlink } from "@/lib";
import { handlerParams, initEventHandler  } from "@/lib/extension-action";
import { waitForElement } from "@/lib/wait-for-selector";
import type { SourceCode } from '@/lib/types'
import '@/assets/index.css'

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const selector = 'pre>code'
    const codeDom = await waitForElement<HTMLDivElement>(selector)
    if (!codeDom) return
    const codeEleList = $$(selector)
    let marked = false
    const codeList: SourceCode[] = codeEleList.map((item) => {
      return {
        id: '0',
        language: getLangFromCodeEle(item),
        code: item.innerText
      }
    })

    const contentReq = {
      'get-code-list': getCodeList,
      'scroll-to-element': scrollToElement
    }

    function getCodeList() {
      if (!marked) {
        codeEleList.forEach((item, index) => {
          const id = uuid()
          item.setAttribute('cc-id', id)
          codeList[index].id = id
        })
        marked = true
      }
      return codeList
    }

    function scrollToElement(params: handlerParams) {
      const {data} = params
      if (!data) return
      const id = data.id
      const target = getEle(`[cc-id]=${id}`) as HTMLElement
      if (!target) return
      scrollAndBlink(target, target)
    }

    initEventHandler(contentReq)
  },
})

function getLangFromCodeEle(el: HTMLElement) {
  let lang = el.getAttribute('lang')
  if (!lang) {
    const match = el.className.match(/lang-(\S)/)
    if (match) {
      lang = match[1]
    }
  }
  return lang || 'text'
}
