import SyntaxHighlighter from 'react-syntax-highlighter';

SyntaxHighlighter.supportedLanguages
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useLocalStorage } from "react-use"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
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

type Item = {
  label: string,
  value: string
}

const langList: Item[] = [
  // top 50 of tiobe-index
  {label: "Python", value: "python"},
  {label: "C++", value: "cpp"},
  {label: "C", value: "c"},
  {label: "Java", value: "java"},
  {label: "C#", value: "csharp"},
  {label: "JavaScript", value: "javascript"},
  {label: "Visual Basic", value: "vbnet"},
  {label: "Go", value: "go"},
  {label: "Perl", value: "perl"},
  {label: "Delphi/Pascal", value: "delphi"},
  {label: "Fortran", value: "fortran"},
  {label: "SQL", value: "sql"},
  {label: "Ada", value: "ada"},
  {label: "R", value: "r"},
  {label: "PHP", value: "php"},
  {label: "MATLAB", value: "matlab"},
  {label: "Scratch", value: "scratch"},
  {label: "Rust", value: "rust"},
  {label: "Kotlin", value: "kotlin"},
  {label: "Assembly language", value: "x86asm"}, // x86asm
    {label: "Lisp", value: "lisp"},
    // {label: "COBOL", name: // "cobol"},
    // {label: "Classic Visual Basic", name: // "classic visual basic"},
    {label: "Prolog", value: "prolog"},
    {label: "Swift", value: "swift"},
    {label: "Ruby", value: "ruby"},
    {label: "SAS", value: "sas"},
    {label: "Dart", value: "dart"},
    {label: "Objective-C", value: "objective-c"},
    {label: "Julia", value: "julia"},
    {label: "Lua", value: "lua"},
    {label: "Haskell", value: "haskell"},
    {label: "Scala", value: "scala"},
    // {label: "(Visual) FoxPro", value: // "(visual) foxpro"},
    {label: "TypeScript", value: "typescript"},
    {label: "GAMS", value: "gams"},
    {label: "VBScript", value: "vbscript"},
    // {label: "PL/SQL", value: "sql"},
    {label: "ABAP", value: "abap"},
    // {label: "X++", value: // "x++"},
    {label: "Elixir", value: "elixir"},
    {label: "Solidity", value: "solidity"},
    {label: "ML", value: "ml"},
    {label: "Erlang", value: "erlang"},
    {label: "PowerShell", value: "powershell"},
    // {label: "Ladder Logic", value: // "ladder logic"},
    {label: "Bash", value: "bash"},
    // {label: "V", value: // "v"},
    {label: "Awk", value: "awk"},
    {label: "LabVIEW", value: "labview"},
    // extended
    {label: "Vim", value: 'vim'},
    {label: "XML", value: 'xml'},
    {label: "protobuf", value: 'protobuf'},
    {label: "HTML", value: 'htmlbars'},
]

type LanguageMap = {
  [K in typeof langList[number]['value']]: typeof langList[number]['label']
}

const langMap: LanguageMap = langList.reduce((acc, curr) => {
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
    <div className="flex justify-start gap-2">
      <div className="font-semibold mt-[6px]">Syntax Highlight Language</div>
      <div className="flex flex-col items-start gap-2">
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
      <div className='flex items-center gap-1 mt-2'>
        {history?.map(item => (
          <div onClick={() => setLanguage(item)} className="py-1 px-2 bg-gray-600 rounded-full cursor-pointer text-white">{langMap[item]}</div>
        ))}
      </div>
      </div>
    </div>
  )
}
