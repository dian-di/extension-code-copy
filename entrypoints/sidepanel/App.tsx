import { useEffect, useMemo, useState } from "react"
import { sendMessageToActiveTab } from "@/lib/extension-action"
import { toast, ToastType } from "@/lib/toast"
import type { SourceCode } from '@/lib/types'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { ChevronUp, Copy, SquareDashedMousePointer, RefreshCcw, Settings } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils";
import LanguageSelector from './components/languageSelector';
import { langMap } from './components/languageSelector'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
    toSetList()
  }, [])

  function toSetList() {
    getCodeList(setList)
  }

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
    return list.length !== 0 && list.every(item => item.isChecked)
  }, [list])

  const toggleAllCheck = () => {
    setList(prevList => prevList.map(item => ({...item, isChecked: !isAllChecked})))
  }

  const setListLanguage = (language: string) => {
    setLanguage(language)
    setList(prevList => prevList.map(item => ({...item, language})))
  }

  return (
    <div className="px-2">
      <div className="flex justify-between gap-2 py-4 px-2 sticky top-0 z-50 bg-white">
        <div className="flex items-center gap-2 ">
          <Checkbox checked={isAllChecked} onCheckedChange={toggleAllCheck} />
          <Button
            className="text-base font-semibold cursor-pointer rounded-full shadow"
            onClick={copySelected}>
              Copy Selected
          </Button>
        </div>
       <div className="flex gap-4 items-center">
        <RefreshCcw size={30} onClick={toSetList} className="cursor-pointer"/>
       
        <Popover>
          <PopoverTrigger asChild>
            <Settings size={30} className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent>
            <LanguageSelector setLanguage={setListLanguage} language={language} /> 
          </PopoverContent>
        </Popover>
       </div> 
      </div>
      
      {list.map((item, index) => {
        return (
          <div
            key={`${item.id}_${item.language}`}
            className="mb-6 rounded-md overflow-hidden"
          >
            <div className="flex justify-between bg-gray-100 px-2 py-1 text-sm items-center text-gray-500">
              <div className="flex items-center w-full py-1">
              <Checkbox className="bg-white" id={item.id} checked={item.isChecked}
                onCheckedChange={() => toggleCheck(item.id)} />
              <label
                htmlFor={item.id}
                className="text-base font-bold pl-2 w-full"
              >{index + 1}<span className="ml-4 ">{langMap[item.language] || item.language || 'Unknown Language'}</span></label>
              </div>

              <div className="flex gap-2">
                <SquareDashedMousePointer className="hover:text-black cursor-pointer"
                  onClick={() => scrollToTarget(item.id)}/>
                <Copy className="hover:text-black cursor-pointer"
                  onClick={() => handleCopy(index)} />
                  <ChevronUp onClick={() => toggleExpand(item.id)} className={cn('transition-transform', item.isExpanded ? '': 'rotate-180', 'hover:text-black  cursor-pointer')} />
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