"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext, Controller, FieldError } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { materialSchema } from "@/schemas/materialForm";
import { z } from "zod";

interface ComboboxProps {
  name: keyof FormType | `materials.${number}.material_id`;
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: FieldError;
}

type FormType = z.infer<typeof materialSchema>;

export function Combobox({
  name,
  label,
  options,
  placeholder = "Selecione uma opção...",
  error,
}: ComboboxProps) {
  const { control } = useFormContext<FormType>();
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={name} className="text-sm">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              asChild
              className={`${error?.message && "border-red-500"}`}
            >
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={`w-80 h-10 mt-1 justify-between`}
              >
                {field.value
                  ? options.find((option) => option.value === field.value)
                      ?.label
                  : placeholder}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <Command>
                <CommandInput placeholder="Search..." className="h-9" />
                <CommandList>
                  <CommandEmpty>Nada encontrado.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        className="h-10"
                        onSelect={(currentValue) => {
                          field.onChange(
                            currentValue === field.value ? "" : currentValue
                          );
                          setOpen(false);
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            field.value === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  );
}
