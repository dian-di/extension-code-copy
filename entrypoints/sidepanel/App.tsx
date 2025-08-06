import { useEffect, useState } from "react"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"

function SiderPanelApp() {
  const [list, setList] = useState<string[]>([])
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])

  useEffect(() => {
    // 接收来自 content-script 的消息
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === "SELECT-CODE-LIST") {
        setList(message.data)
      }
    })
  }, [])

  useEffect(() => {
    const blocks = document.querySelectorAll("pre code")
    blocks.forEach((block) => hljs.highlightElement(block as HTMLElement))
  }, [list, expandedIndexes])

  const handleCopy = (index: number) => {
    const container = document.getElementById(`code-content-${index}`)
    if (container) {
      const codeElement = container.querySelector("code")
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
          alert("复制成功！")
        })
      }
    }
  }

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  const extractLanguage = (htmlString: string): string => {
    const match = htmlString.match(/class=["'][^"']*language-([\w\d-]+)/)
    if (match && match[1]) {
      const lang = match[1]
      return lang
    }
    return "Unknown"
  }

  return (
    <div>
      <div className="mt-4 ml-2 text-lg">SiderPanel</div>

      {list.map((item, index) => {
        const isExpanded = expandedIndexes.includes(index)
        const lang = extractLanguage(item)

        return (
          <div
            key={index}
            className="mb-6 rounded overflow-hidden"
          >
            <div className="flex justify-between bg-gray-100 px-2 py-1 text-sm items-center">
              <span className="font-medium text-gray-700">{lang}</span>

              <div className="flex gap-2">
                <button 
                  className="text-blue-600 hover:underline" 
                  >
                    查看源码
                </button>
                {isExpanded && <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleCopy(index)}
                >
                  复制
                </button>}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => toggleExpand(index)}
                >
                  {isExpanded ? "折叠" : "展开"}
                </button>
              </div>
            </div>

            {isExpanded && <div
              id={`code-content-${index}`}
              className="transition-all"
              dangerouslySetInnerHTML={{ __html: item }}
            />}
          </div>
        )
      })}
    </div>
  )
}

export default SiderPanelApp