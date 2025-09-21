import { useEffect, useMemo, useState } from "react"
import { sendMessageToActiveTab } from "@/lib/extension-action"
import { toast, ToastType } from "@/lib/toast"
import type { SourceCode } from '@/lib/types'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { ChevronUp, Copy, SquareDashedMousePointer } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils";
import LanguageSelector from './components/languageSelector';
import { getLanguage as getLanguageStorage, setLanguage as setLanguageStorage } from "@/lib/storage";

type ExtendedSourceCode = SourceCode & {
  isExpanded: boolean
  isChecked: boolean
}

function getCodeList(cb: (codeList: ExtendedSourceCode[]) => void) {
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
    cb(codeList)
  })
}

function SiderPanelApp() {
  const [list, setList] = useState<ExtendedSourceCode[]>([])
  const [language, setLanguage] = useState<string>('')

  useEffect(() => {
    getLanguageStorage().then(lang => {
      if (lang) {
        setLanguage(lang)
      }
    })
    getCodeList(setList)
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
        type: ToastType.Warning
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
    return list.every(item => item.isChecked)
  }, [list])

  const toggleAllCheck = () => {
    setList(prevList => prevList.map(item => ({...item, isChecked: !isAllChecked})))
  }

  const setListLanguage = (language: string) => {
    setLanguage(language)
    setLanguageStorage(language)
    setList(prevList => prevList.map(item => ({...item, language})))
  }

  return (
    <div>
      <div className="flex justify-between gap-2 p-2 sticky top-0 z-50 bg-white">
        <div className="flex items-center">
          <Checkbox checked={isAllChecked} onCheckedChange={toggleAllCheck} />
          <button 
            className="text-sm text-green-400 cursor-pointer w-38"
            onClick={copySelected}>
              Copy Selected Code
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-semibold">Display Language</div>
          <div>
            <LanguageSelector setLanguage={setListLanguage} language={language} />
          </div>
        </div>
      </div>
      
      {list.map((item, index) => {
        return (
          <div
            key={`${item.id}_${item.language}`}
            className="mb-6 rounded-2xl"
          >
            <div className="flex justify-between bg-gray-100 px-2 py-1 text-sm items-center">
              <div className="flex items-center w-full py-1">
              <Checkbox className="bg-white" id={item.id} checked={item.isChecked}
                onCheckedChange={() => toggleCheck(item.id)} />
              <label
                htmlFor={item.id}
                className="text-base font-bold pl-2 w-full"
              >{index + 1}</label>
              </div>

              <div className="flex gap-2">
                <SquareDashedMousePointer className="text-blue-400 cursor-pointer"
                  onClick={() => scrollToTarget(item.id)}/>
                <Copy className="text-green-400 cursor-pointer"
                  onClick={() => handleCopy(index)} />
                  <ChevronUp onClick={() => toggleExpand(item.id)} className={cn('transition-transform', item.isExpanded ? '': 'rotate-180', 'text-gray-400 cursor-pointer')} />
              </div>
            </div>

            {item.isExpanded && <SyntaxHighlighter language={item.language} showLineNumbers={true} style={a11yDark}>
              {item.code}
            </SyntaxHighlighter>}
          </div>
        )
      })}
    </div>
  )
}

export default SiderPanelApp