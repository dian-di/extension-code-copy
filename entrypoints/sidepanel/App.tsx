import { useEffect, useState } from "react"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"
import { sendBrowserMessage } from "@/lib/extension-action"
import { toast } from "@/lib/toast"
import type { SourceCode } from '@/lib/types'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function SiderPanelApp() {
  const [list, setList] = useState<SourceCode[]>([])
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])
  
  useEffect(() => {
    sendBrowserMessage({
      greeting: 'get-code-list',
    }).then(res => {
      console.log('code-list', res)
      setList(res.data as SourceCode[])
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
          toast({
            text: 'Copied Successful. ✨',
          })
        })
      }
    }
  }

  const scrollToTarget = (id: string) => {
    sendBrowserMessage({
      greeting: 'scroll-to-element',
      data: {
        id
      }
    })
  }

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div>
      <div className="mt-4 ml-2 text-lg">Source Code</div>

      {list.map((item, index) => {
        const isExpanded = expandedIndexes.includes(index)

        return (
          <div
            key={item.id}
            className="mb-6 rounded overflow-hidden"
          >
            <div className="flex justify-between bg-gray-100 px-2 py-1 text-sm items-center">
              <span className="font-medium text-gray-700">{item.language}</span>

              <div className="flex gap-2">
                <button 
                  className="text-blue-600 hover:underline"
                  onClick={() => scrollToTarget(item.id)}
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

            {isExpanded && <SyntaxHighlighter language="javascript" className="transition-all" startingLineNumber={true} style={dark}>
              {item.code}
            </SyntaxHighlighter>}
          </div>
        )
      })}
    </div>
  )
}

export default SiderPanelApp