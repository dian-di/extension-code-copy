export function getEle(el: string, context: HTMLElement = document.body) {
  if (!el) return
  return context.querySelector(el)
}

export function $$(el: string, context: HTMLElement = document.body) {
  if (!el) return []
  return Array.from((context).querySelectorAll(el)) as HTMLElement[]
}

export function scrollAndBlink(scrollTarget: HTMLElement, blinkTarget: HTMLElement) {
  scrollTarget?.scrollIntoView({ behavior: 'smooth' })
  blinkTarget?.classList.add('alerts-border')
  setTimeout(() => {
    blinkTarget?.classList.remove('alerts-border')
  }, 3000)
}

export function uuid() {
  return (Math.random() + 1).toString(36).substring(4)
}
