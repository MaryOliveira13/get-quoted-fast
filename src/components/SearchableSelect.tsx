import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface SearchableOption {
  /** Real identifier stored alongside the label */
  id: string;
  /** Text shown in the field and searched against */
  label: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  /** Selected label (the value persisted by the form) */
  value: string;
  onChange: (label: string, option: SearchableOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  /** Max results rendered per search */
  maxResults?: number;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhum resultado encontrado",
  disabled = false,
  maxResults = 30,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = disabled === true;

  useEffect(() => {
    if (open && !isDisabled) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setTerm("");
    }
  }, [open, isDisabled]);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    const base = q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
    return base.slice(0, maxResults);
  }, [options, term, maxResults]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={isDisabled}
          ref={ref}
          className={cn(
            "w-full justify-between font-normal bg-background border-input h-10 px-3",
            "hover:bg-background hover:text-foreground data-[state=open]:border-primary",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        position="popper"
        sideOffset={4}
        className="z-[9999] p-0 w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)]"
      >
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            value={term}
            onValueChange={setTerm}
            placeholder={searchPlaceholder}
            disabled={false}
          />
          <CommandList className="max-h-60 overflow-y-auto overscroll-contain">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filtered.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.label}
                  onSelect={() => {
                    onChange(o.label, o);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer",
                    o.label === value && "bg-primary/10 text-primary"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      o.label === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{o.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
