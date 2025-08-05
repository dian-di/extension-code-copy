export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    console.log('main')
  },
})
