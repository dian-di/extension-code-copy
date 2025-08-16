import SyntaxHighlighter from 'react-syntax-highlighter';

SyntaxHighlighter.supportedLanguages
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

const langList = [
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
    {label: "Lisp", name: "lisp"},
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

type Props = {
  language: string | null,
  setLanguage: (lang: string) => void
}

export default function LanguageSelector({ setLanguage, language }: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
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
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {langList.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    if (currentValue && currentValue !== language) {
                      setLanguage(currentValue)
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
  )
}
