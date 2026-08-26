import { useEffect, useMemo, useRef, useState } from "react";
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
  /** Debounce in ms applied to the typed term */
  debounceMs?: number;
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
  disabled,
  debounceMs = 300,
  maxResults = 30,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(term), debounceMs);
    return () => timer.current && clearTimeout(timer.current);
  }, [term, debounceMs]);

  useEffect(() => {
    if (!open) {
      setTerm("");
      setDebounced("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const base = q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
    return base.slice(0, maxResults);
  }, [options, debounced, maxResults]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
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
        className="p-0 w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] z-50"
      >
        {/* shouldFilter=false: filtering is handled by the debounced term */}
        <Command shouldFilter={false}>
          <CommandInput
            value={term}
            onValueChange={setTerm}
            placeholder={searchPlaceholder}
          />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filtered.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.id}
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
}
