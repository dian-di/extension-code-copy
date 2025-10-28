export type Rule = {
  selectorList: string[]
  langParse: (el: HTMLElement) => string | undefined | null
  codeParse: (el: HTMLElement) => string | undefined | null
}

const selectorList: string[] = ['pre', '.cm-editor .cm-content']

export const rules: Record<string, Rule> = {
  // https://blog.ml.cmu.edu/2025/06/01/rlhf-101-a-technical-tutorial-on-reinforcement-learning-from-human-feedback/
  // https://www.hackingwithswift.com/quick-start/beginners/how-to-create-and-use-closures
  // https://stackoverflow.com/questions/29629492/how-to-query-elements-within-shadow-dom-from-outside-in-dart
  default: {
    selectorList,
    codeParse,
    langParse,
  },
  'supabase.com': {
    selectorList: ['pre>code>.flex-grow'],
    codeParse,
    langParse,
  },
  // https://chat.deepseek.com/a/chat/s/ddde3cd0-2677-4e06-99a3-2853dcc87a30
  'deepseek.com': {
    selectorList,
    codeParse,
    langParse: (el: HTMLElement) => {
      const pre = el.previousElementSibling
      if (!pre) return
      return pre?.querySelector('div span')?.textContent
    }
  },
  // https://github.com/MrBr/antd-zod
  'github.com': {
    selectorList,
    codeParse,
    langParse: (el: HTMLElement) => {
      return getLangFromClass(el.parentElement, /highlight-source-(\S+)/)
    }
  },
  // https://www.runoob.com/opencv/opencv-first-example.html
  'runoob.com': {
    selectorList: [...selectorList, '.example_code'],
    codeParse,
    langParse: (el: HTMLElement) => {
      const pre = el.previousElementSibling
      // 实例（Python）
      // 实例（C++）
      if (!pre) return
      return pre.textContent.match(/（(\S+)）/)?.[1].toLowerCase()
    }
  },
  // https://www.w3schools.com/python/python_numbers.asp
  'w3schools.com': {
    selectorList: [...selectorList, '.w3-code'],
    codeParse,
    langParse: (el: HTMLElement) => el.querySelector('span')?.className.replace('color', '')
  },
  // https://docs.opencv.org/4.12.0/d9/db0/tutorial_hough_lines.html
  'opencv.org': {
    selectorList: [...selectorList, '.fragment'],
    codeParse,
    langParse: (el: HTMLElement) => getLangFromClass(el.parentElement, /label_(\S+)/)
  },
  // mdn-code-example
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot
  // interactive-example
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr
  'mozilla.org': {
    selectorList: [...selectorList, 'mdn-code-example', 'interactive-example'],
    codeParse: (el: HTMLElement) => {
      const tagName = el.tagName
      let target
      if (tagName === 'INTERACTIVE-EXAMPLE') {
        // TODO: 两种情况
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
        target = el.shadowRoot?.querySelector('mdn-play-editor')?.shadowRoot?.querySelector('.cm-content')
      } else if (tagName === 'MDN-CODE-EXAMPLE') {
        target = el.shadowRoot?.querySelector('pre')
      } else {
        target = el
      }
      return (target as HTMLElement)?.innerText
    },
    langParse: (el: HTMLElement) => {
      const tagName = el.tagName
      let target
      if (tagName === 'INTERACTIVE-EXAMPLE') {
        target = el.shadowRoot?.querySelector('mdn-play-editor')?.shadowRoot?.querySelector('.cm-content')
        return target?.getAttribute('data-language')
      } else if (tagName === 'MDN-CODE-EXAMPLE') {
        target = el.shadowRoot?.querySelector('pre') as HTMLElement
        return getLangFromClass(target, /brush:\s+(\S+)/)
      } else {
        return getLangFromClass(el, /brush:\s+(\S+)/)
      }
    }
  },
}

function getLangFromClass(el: HTMLElement | null, regex: RegExp) {
  if (!el) return
  const match = el.className.match(regex)
  if (match) {
    return match[1]
  }
}

function codeParse(el: HTMLElement) {
  return el.innerText
}

function langParse(el: HTMLElement): string | null {
  let lang = el.getAttribute('lang') || el.getAttribute('language') || el.getAttribute('data-lang') || el.getAttribute('data-language') || el.getAttribute('data-enlighter-language')
  if (!lang) {
    const match = el.className.match(/lang(?:[^-]+)?-(\S+)/)
    if (match) {
      lang = match[1]
    } else if (el.tagName === 'PRE') {
      const codeEle = el.querySelector('code')
      if (codeEle) {
        lang = langParse(codeEle)
      }
    }
  }
  return lang
}
