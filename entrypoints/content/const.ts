export type Rule = {
  selectorList: string[]
  langParse: (el: HTMLElement) => string | undefined | null
  codeParse: (el: HTMLElement) => string | undefined | null
}

const selectorList: string[] = ['pre']

export const rules: Record<string, Rule> = {
  // https://blog.ml.cmu.edu/2025/06/01/rlhf-101-a-technical-tutorial-on-reinforcement-learning-from-human-feedback/
  // https://www.hackingwithswift.com/quick-start/beginners/how-to-create-and-use-closures
  // https://stackoverflow.com/questions/29629492/how-to-query-elements-within-shadow-dom-from-outside-in-dart
  default: {
    selectorList,
    codeParse,
    langParse,
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
        // // TODO: 元素里有多个tab，每个tab展示一段code
        // // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr
        // target = el.shadowRoot?.querySelector('mdn-play-editor')?.shadowRoot?.querySelector('.cm-content')
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
  // https://github.com/MrBr/antd-zod
  'github.com': {
    selectorList,
    codeParse,
    langParse: (el: HTMLElement) => {
      return getLangFromClass(el.parentElement, /highlight-source-(\S+)/)
    }
  },
  // https://www.w3schools.com/python/python_numbers.asp
  'w3schools.com': {
    selectorList: [...selectorList, '.w3-code'],
    codeParse,
    langParse: (el: HTMLElement) => el.querySelector('span')?.className.replace('color', '')
  },
  // https://leetcode.com/problems/string-to-integer-atoi/solutions/6924378/video-o-n-time-and-o-1-space/
  'leetcode.com': {
    selectorList,
    codeParse,
    langParse: (el: HTMLElement) => {
      return getLangFromClass(el.querySelector('code'), /language-(\S+)/)
    },
  }
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

function langParse(el: HTMLElement) {
  let lang = el.getAttribute('lang') || el.getAttribute('language') || el.getAttribute('data-enlighter-language')
  if (!lang) {
    const match = el.className.match(/lang(?:[^-]+)?-(\S+)/)
    if (match) {
      lang = match[1]
    }
  }
  return lang
}
