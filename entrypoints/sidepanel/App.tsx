import { useEffect, useMemo, useState } from "react"
import { sendMessageToActiveTab } from "@/lib/extension-action"
import { toast } from "@/lib/toast"
import type { SourceCode } from '@/lib/types'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { ChevronDown, ChevronUp, Copy } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

type ExtendedSourceCode = SourceCode & {
  isExpanded: boolean
  isChecked: boolean
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
          isChecked: false,
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

  const copySelected = async () => {
    const checkedList = list.filter(item => item.isChecked)
    if (!checkedList.length) {
      toast({
        text: 'You have to select at least one item.',
      })
      return
    }
    navigator.clipboard.writeText(checkedList.map(item => item.code).join(`\n\n`)).then(() => {
      toast({
        text: 'Copied Successful. ✨',
      })
    })
  }

  const toggleExpand = (id: string) => {
    setList(prevList => 
      prevList.map(item => 
        item.id === id ? {...item, isExpanded: !item.isExpanded} : item
      )
    )
  }

  const toggleCheck = (id: string) => {
    setList(prevList => 
      prevList.map(item => 
        item.id === id ? {...item, isChecked: !item.isChecked} : item
      )
    )
  }

  const isAllChecked = useMemo(() => {
    // 只有当 a 或 b 变化时才重新计算
    return list.every(item => item.isChecked)
  }, [list])

  const toggleAllCheck = () => {
    setList(prevList => prevList.map(item => ({...item, isChecked: !isAllChecked})))
  }

  return (
    <div>
      <div className="flex flex-row items-center gap-4 p-4">
      <Checkbox checked={isAllChecked}
      onCheckedChange={toggleAllCheck} />
        <div>
        <button 
                  className="text-xl text-blue-600 cursor-pointer"
                  onClick={copySelected}
                  >
                    Copy Selected Code
                </button>
      </div>
      </div>
      
      {list.map((item, index) => {
        return (
          <div
            key={item.id}
            className="px-2 mb-6"
          >
            <div className="flex justify-between bg-gray-100 px-2 py-1 text-sm items-center">
              <div className="flex items-center w-full">
              <Checkbox className="bg-white" id={item.id} checked={item.isChecked}
                                        onCheckedChange={() => toggleCheck(item.id)} />
              <label
                htmlFor={item.id}
                className="pl-2 w-full"
              >{item.language}</label>
              </div>

              <div className="flex gap-2">
                <button 
                  className="text-blue-600 hover:underline hover:cursor-default"
                  onClick={() => scrollToTarget(item.id)}
                  >
                    Inspect
                </button>
                <button
                  className="text-blue-600 cursor-pointer"
                  onClick={() => handleCopy(index)}
                >
                  Copy
                </button>
                <button
                  className="text-blue-600 cursor-pointer"
                  onClick={() => toggleExpand(item.id)}
                >
                  {item.isExpanded ? <ChevronUp /> : <ChevronDown />}
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