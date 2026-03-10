import { useEffect, useMemo, useState } from "react"
import { sendMessageToActiveTab, getActiveTabUrl } from "@/lib/extension-action"
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
import { TooltipProvider } from "@/components/ui/tooltip"
import analytics from "@/lib/analytics"

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
    // 追踪侧边栏打开
    getActiveTabUrl().then((url) => {
      analytics.trackClick('sidepanel_opened', url)
    })
  }, [])

  const toSetList = async () => {
    getCodeList(setList)
    // 追踪刷新操作
    const pageUrl = await getActiveTabUrl()
    await analytics.trackClick('refresh_list', pageUrl)
  }

  const handleCopy = async (index: number) => {
    const code = list[index].code
    navigator.clipboard.writeText(code).then(async () => {
      toast({
        text: 'Copied Successful. ✨',
      })
      // 追踪单个复制操作
      const pageUrl = await getActiveTabUrl()
      await analytics.trackCopy('single', pageUrl, code.length)
    })
  }

  const scrollToTarget = async (id: string) => {
    sendMessageToActiveTab({
      greeting: 'scroll-to-element',
      data: {
        id
      }
    })
    // 追踪滚动到元素操作
    const pageUrl = await getActiveTabUrl()
    await analytics.trackScrollToElement(pageUrl, id)
  }

  const copySelected = async () => {
    const checkedList = list.filter(item => item.isChecked)
    if (!checkedList.length) {
      toast({
        text: 'You have to select at least one item.',
        type: ToastType.Warning
      })
      // 追踪尝试复制但未选择任何项
      const pageUrl = await getActiveTabUrl()
      await analytics.trackClick('copy_selected_no_selection', pageUrl)
      return
    }
    const combinedCode = checkedList.map(item => item.code).join(`\n\n`)
    navigator.clipboard.writeText(combinedCode).then(async () => {
      toast({
        text: 'Copied Successful. ✨',
      })
      // 追踪批量复制操作
      const pageUrl = await getActiveTabUrl()
      await analytics.trackCopy('multiple', pageUrl, combinedCode.length)
    })
  }

  const toggleExpand = async (id: string) => {
    const item = list.find(i => i.id === id)
    const newExpandedState = !item?.isExpanded
    setList(prevList => 
      prevList.map(item => 
        item.id === id ? {...item, isExpanded: newExpandedState} : item
      )
    )
    // 追踪展开/收起操作
    const pageUrl = await getActiveTabUrl()
    await analytics.trackClick('toggle_expand', pageUrl, {
      element_id: id,
      expanded: newExpandedState,
    })
  }

  const toggleCheck = async (id: string) => {
    const item = list.find(i => i.id === id)
    const newCheckedState = !item?.isChecked
    setList(prevList => 
      prevList.map(item => 
        item.id === id ? {...item, isChecked: newCheckedState} : item
      )
    )
    // 追踪复选框点击
    const pageUrl = await getActiveTabUrl()
    await analytics.trackClick('toggle_check', pageUrl, {
      element_id: id,
      checked: newCheckedState,
    })
  }

  const isAllChecked = useMemo(() => {
    return list.length !== 0 && list.every(item => item.isChecked)
  }, [list])

  const toggleAllCheck = async () => {
    const newCheckedState = !isAllChecked
    setList(prevList => prevList.map(item => ({...item, isChecked: newCheckedState})))
    // 追踪全选/取消全选
    const pageUrl = await getActiveTabUrl()
    await analytics.trackClick('toggle_all_check', pageUrl, {
      checked: newCheckedState,
      total_items: list.length,
    })
  }

  const setListLanguage = (language: string) => {
    setLanguage(language)
    setList(prevList => prevList.map(item => ({...item, language})))
  }

  return (
    <TooltipProvider>
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
          <RefreshCcw size={24} onClick={toSetList} className="cursor-pointer"/>
        
          <Popover>
            <PopoverTrigger asChild>
              <Settings 
                size={24} 
                className="cursor-pointer" 
                onClick={async () => {
                  // 追踪设置按钮点击
                  const pageUrl = await getActiveTabUrl()
                  await analytics.trackClick('settings_opened', pageUrl)
                }}
              />
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
                  <SquareDashedMousePointer size={20} className="hover:text-black cursor-pointer"
                    onClick={() => scrollToTarget(item.id)}/>
                  <Copy size={20} className="hover:text-black cursor-pointer"
                    onClick={() => handleCopy(index)} />
                  <ChevronUp size={20} onClick={() => toggleExpand(item.id)} className={cn('transition-transform', item.isExpanded ? '': 'rotate-180', 'hover:text-black  cursor-pointer')} />
                </div>
              </div>

              {item.isExpanded && <SyntaxHighlighter language={item.language} showLineNumbers={true} style={a11yDark}>
                {item.code}
              </SyntaxHighlighter>}
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

export default SiderPanelApp