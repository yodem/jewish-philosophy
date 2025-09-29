"use client"

import * as React from "react"
import { Check, ChevronsUpDown as ChevronsUpDownIcon } from "lucide-react"
import { Category } from "@/types"
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

interface CategoryComboboxProps {
  categories: Category[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

const getCategoryTypeLabel = (type: 'term' | 'person' | 'genre' | null): string => {
  switch (type) {
    case 'person':
      return 'אדם';
    case 'genre':
      return 'ז׳אנר';
    case 'term':
      return 'מושג';
    case null:
    default:
      return 'כללי';
  }
};

export function CategoryCombobox({
  categories,
  value,
  onValueChange,
  placeholder = "בחרו קטגוריה...",
  emptyMessage = "לא נמצאו קטגוריות.",
  disabled = false,
  className,
  loading = false,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Create options array for the combobox
  const options = React.useMemo(() => [
    {
      value: 'all',
      label: 'כל הקטגוריות',
      description: ''
    },
    ...categories.map(category => ({
      value: category.slug,
      label: category.name,
      description: getCategoryTypeLabel(category.type)
    }))
  ], [categories]);

  const selectedOption = options.find(option => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-right", className)}
          disabled={disabled || loading}
          dir="rtl"
        >
          {loading ? (
            <span className="text-gray-500 text-right">טוען קטגוריות...</span>
          ) : selectedOption ? (
            <div className="flex flex-col items-end text-right flex-1">
              <span>{selectedOption.label}</span>
              {selectedOption.description && (
                <span className="text-xs text-gray-500">{selectedOption.description}</span>
              )}
            </div>
          ) : (
            <span className="text-right">{placeholder}</span>
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="end" side="bottom">
        <Command>
          <CommandInput placeholder="חפש קטגוריה..." className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "all" : currentValue);
                    setOpen(false);
                  }}
                  className="text-right"
                  dir="rtl"
                >
                  <div className="flex flex-col items-end text-right flex-1">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-gray-500">{option.description}</span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0"
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
