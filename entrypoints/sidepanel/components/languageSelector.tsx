import SyntaxHighlighter from 'react-syntax-highlighter';

SyntaxHighlighter.supportedLanguages
import * as React from "react"
import { Check, ChevronsUpDown, Info, X } from "lucide-react"
import { useLocalStorage } from "react-use"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Item = {
  label: string,
  value: string
}

const langList: Item[] = [
  // top 50 of tiobe-index
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "C", value: "c" },
  { label: "Java", value: "java" },
  { label: "C#", value: "csharp" },
  { label: "JavaScript", value: "javascript" },
  { label: "Visual Basic", value: "vbnet" },
  { label: "Go", value: "go" },
  { label: "Perl", value: "perl" },
  { label: "Delphi/Pascal", value: "delphi" },
  { label: "Fortran", value: "fortran" },
  { label: "SQL", value: "sql" },
  { label: "Ada", value: "ada" },
  { label: "R", value: "r" },
  { label: "PHP", value: "php" },
  { label: "MATLAB", value: "matlab" },
  { label: "Scratch", value: "scratch" },
  { label: "Rust", value: "rust" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Assembly language", value: "x86asm" }, // x86asm
  { label: "Lisp", value: "lisp" },
  // {label: "COBOL", name: // "cobol"},
  // {label: "Classic Visual Basic", name: // "classic visual basic"},
  { label: "Prolog", value: "prolog" },
  { label: "Swift", value: "swift" },
  { label: "Ruby", value: "ruby" },
  { label: "SAS", value: "sas" },
  { label: "Dart", value: "dart" },
  { label: "Objective-C", value: "objective-c" },
  { label: "Julia", value: "julia" },
  { label: "Lua", value: "lua" },
  { label: "Haskell", value: "haskell" },
  { label: "Scala", value: "scala" },
  // {label: "(Visual) FoxPro", value: // "(visual) foxpro"},
  { label: "TypeScript", value: "typescript" },
  { label: "GAMS", value: "gams" },
  { label: "VBScript", value: "vbscript" },
  // {label: "PL/SQL", value: "sql"},
  { label: "ABAP", value: "abap" },
  // {label: "X++", value: // "x++"},
  { label: "Elixir", value: "elixir" },
  { label: "Solidity", value: "solidity" },
  { label: "ML", value: "ml" },
  { label: "Erlang", value: "erlang" },
  { label: "PowerShell", value: "powershell" },
  // {label: "Ladder Logic", value: // "ladder logic"},
  { label: "Bash", value: "bash" },
  // {label: "V", value: // "v"},
  { label: "Awk", value: "awk" },
  { label: "LabVIEW", value: "labview" },
  // extended
  { label: "Vim", value: 'vim' },
  { label: "XML", value: 'xml' },
  { label: "protobuf", value: 'protobuf' },
  { label: "HTML", value: 'htmlbars' },
]

type LanguageMap = {
  [K in typeof langList[number]['value']]: typeof langList[number]['label']
}

export const langMap: LanguageMap = langList.reduce((acc, curr) => {
  return {
    ...acc,
    [curr.value]: curr.label
  }
}, {})

type Props = {
  language: string | null,
  setLanguage: (lang: string) => void
}

export default function LanguageSelector({ setLanguage, language }: Props) {
  const [open, setOpen] = React.useState(false)
  const [history, setHistory] = useLocalStorage<string[]>("searchHistory", [])

  const addToHistory = (q: string) => {
    if (!q) return
    const newHist = [q, ...(history ?? []).filter((item) => item !== q)]
    setHistory(newHist.slice(0, 5)) // 最多保存 5 条
  }

  return (
    <div className="">
      <div className="flex flex-col items-start gap-3">
        <div className='flex justify-between items-center w-full'>
          <div className='flex items-start gap-1'>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[150px] justify-between"
                  size={'sm'}
                >
                  {language
                    ? langList.find((item) => item.value === language)?.label
                    : "Select language..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search language..." className="h-9" />
                  <CommandList>
                    <CommandGroup>
                      {langList.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.value}
                          onSelect={(currentValue) => {
                            if (currentValue && currentValue !== language) {
                              setLanguage(currentValue)
                              addToHistory(currentValue)
                            }
                            setOpen(false)
                          }}
                        >
                          {item.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              language === item.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={14} className='cursor-pointer'/>
              </TooltipTrigger>
              <TooltipContent>
                This is the language that <br />
                will be used to highlight the code.
              </TooltipContent>
            </Tooltip>
          </div>
          <Button className='text-red-500' onClick={() => setLanguage('')} variant="link">Reset</Button>
        </div>
        <div className='flex flex-wrap items-center text-center gap-2'>
          {history?.map(item => (
            <div className='flex items-center gap-2 rounded-full cursor-pointer bg-secondary px-3 py-2'>
              <div onClick={() => setLanguage(item)} className="rounded-full cursor-pointer ">
                {langMap[item]}
              </div>
              <X className='w-2 h-2' onClick={(e) => {
                e.stopPropagation()
                const data = history?.filter(history_item => history_item != item)
                setHistory(data)
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
