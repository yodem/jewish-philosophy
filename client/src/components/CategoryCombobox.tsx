"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

interface CategoryComboboxProps {
  categories: Category[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
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
  loading = false,
  className,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Convert categories to combobox options
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
  ], [categories])

  const selectedOption = value ? options.find((option) => option.value === value) : null

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-right", className)}
          disabled={disabled}
          dir="rtl"
          type="button"
        >
          {selectedOption ? (
            <span className="text-right">{selectedOption.label}</span>
          ) : (
            <span className="text-muted-foreground text-right">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        // Critical fixes for dialog context:
        style={{
          zIndex: 10000,
          pointerEvents: 'auto'
        }}
        onOpenAutoFocus={(e) => {
          // Prevent the dialog from stealing focus
          e.preventDefault()
        }}
        // Force portal to body to escape dialog container
        forceMount
      >
        <Command className="bg-popover">
          <CommandInput
            placeholder="חפש..."
            className="h-9 text-right"
            dir="rtl"
          />
          <CommandList
            className="max-h-[200px] overflow-y-auto"
            style={{ pointerEvents: 'auto' }}
          >
            <CommandEmpty className="text-right py-2 text-sm">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                  className="text-right cursor-pointer"
                  dir="rtl"
                  onMouseDown={(e) => {
                    // Prevent dialog from intercepting the click
                    e.stopPropagation()
                  }}
                  disabled={option.value === value}
                >
                  <div className="flex flex-col items-start text-right flex-1">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
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
