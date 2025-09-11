import { getEle, $$, uuid, scrollAndBlink } from "@/lib";
import { handlerParams, initEventHandler  } from "@/lib/extension-action";
import { waitForElement } from "@/lib/wait-for-selector";
import type { SourceCode } from '@/lib/types'
import '@/assets/index.css'

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    // https://blog.ml.cmu.edu/2025/06/01/rlhf-101-a-technical-tutorial-on-reinforcement-learning-from-human-feedback/
    // https://www.hackingwithswift.com/quick-start/beginners/how-to-create-and-use-closures
    const selector = 'pre'
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
      let finalTarget = target.closest('pre') as HTMLElement
      if (finalTarget.classList.contains('enlighter-origin')) {
        finalTarget = finalTarget.previousElementSibling as HTMLElement
      }
      scrollAndBlink(finalTarget, finalTarget)
    }

    initEventHandler(contentReq)
  },
})

function getLangFromCodeEle(el: HTMLElement) {
  let lang = el.getAttribute('lang') || el.getAttribute('language') || el.getAttribute('data-enlighter-language')
  console.log(lang, 'lang')
  if (!lang) {
    const match = el.className.match(/lang(?:[^-]+)?-(\S+)/)
    if (match) {
      lang = match[1]
    }
  }
  return lang || 'text'
}
