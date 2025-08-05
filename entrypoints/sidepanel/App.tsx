import { useEffect, useRef, useState } from "react"

function SiderPanelApp() {
  const [list, setList] = useState([])

  useEffect(() => {
      browser.runtime.onMessage.addListener((message) => {
        if (message.type === 'SELECT-CODE-LIST') {
          const codeList = message.data
          // console.log('收到来自content script的消息:',list[0]);
          setList(codeList)
        }
      })
  }, [])

  return (
    <div>
      <div className='mt-4 ml-2 text-lg'>SiderPanel</div>
      {
        list.map((item, index) => (
          <div key={index} className="mb-6">
            {(item as string).substring(0,50)}
          </div>
        ))
      }
    </div>
  )
}

export default SiderPanelApp
