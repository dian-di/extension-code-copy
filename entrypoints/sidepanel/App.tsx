import { useEffect, useState } from "react"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"
import { sendMessageToActiveTab } from "@/lib/extension-action"
import { toast } from "@/lib/toast"
import type { SourceCode } from '@/lib/types'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

type ExtendedSourceCode = SourceCode & {
  isExpanded: boolean
}

function SiderPanelApp() {
  const [list, setList] = useState<ExtendedSourceCode[]>([])
  
  useEffect(() => {
    sendMessageToActiveTab({
      greeting: 'get-code-list',
    }).then((res) => {
      const codeList = res.map((item: SourceCode) => {
        return {
          isExpanded: true,
          ...item
        }
      })
      setList(codeList)
    })
  }, [])

  const handleCopy = (index: number) => {
        navigator.clipboard.writeText(list[index].code).then(() => {
          toast({
            text: 'Copied Successful. ✨',
          })
        })
  }

  const scrollToTarget = (id: string) => {
    sendMessageToActiveTab({
      greeting: 'scroll-to-element',
      data: {
        id
      }
    })
  }

  const toggleExpand = (id: string) => {
    setList(prevList => 
      prevList.map(item => 
        item.id === id ? {...item, isExpanded: !item.isExpanded} : item
      )
    );
  };
  

  return (
    <div>
      <div className="my-4 ml-2 text-lg">Source Code</div>

      {list.map((item, index) => {
        return (
          <div
            key={item.id}
            className="px-2 mb-6"
          >
            <div className="flex justify-between bg-gray-100 px-2 py-1 text-sm items-center">
              <span className="font-medium text-gray-700">{item.language}</span>

              <div className="flex gap-2">
                <button 
                  className="text-blue-600 hover:underline hover:cursor-default"
                  onClick={() => scrollToTarget(item.id)}
                  >
                    查看源码
                </button>
                <button
                  className="text-blue-600 hover:underline hover:cursor-copy"
                  onClick={() => handleCopy(index)}
                >
                  复制
                </button>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => toggleExpand(item.id)}
                >
                  {item.isExpanded ? "折叠" : "展开"}
                </button>
              </div>
            </div>

            {item.isExpanded && <SyntaxHighlighter language={item.language} className="transition-all" showLineNumbers={true} style={docco}>
              {item.code}
            </SyntaxHighlighter>}
          </div>
        )
      })}
    </div>
  )
}

export default SiderPanelApp