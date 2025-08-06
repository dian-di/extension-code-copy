import { $$ } from "@/lib";
import { waitForElement } from "@/lib/wait-for-selector";

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const selector = 'pre>code'
    const codeDom = await waitForElement<HTMLDivElement>(selector)
    if (!codeDom) return
    const codeEleList = $$(selector)
    // codeEleList.forEach(item => {
    //   (item as HTMLElement).style.border = '1px solid red';
    // })

    browser.runtime.sendMessage({
      type: 'SELECT-CODE-LIST',
      data: codeEleList.map(item => {
        return `<pre>${(item as HTMLElement).outerHTML}</pre>`
      })
    })
  },
})
