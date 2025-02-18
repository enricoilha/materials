"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext, Controller, FieldError } from "react-hook-form";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { materialSchema } from "@/schemas/materialForm";
import { z } from "zod";

type FormType = z.infer<typeof materialSchema>;

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

interface ComboboxProps {
  name: keyof FormType | `materials.${number}.material_id`;
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: FieldError;
}

export function Combobox({
  name,
  label,
  options,
  placeholder = "Selecione uma opção...",
  error,
}: ComboboxProps) {
  const { control } = useFormContext<FormType>();
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const fuse = React.useMemo(
    () =>
      new Fuse(options, {
        threshold: 0.2,
        ignoreLocation: true,
        keys: [
          {
            name: "label",
            getFn: (item) => normalizeString(item.label),
          },
        ],
      }),
    [options]
  );

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    return fuse.search(searchValue).map((res) => res.item);
  }, [searchValue, fuse, options]);

  return (
    <div className="relative">
      {label && (
        <label htmlFor={name} className="text-sm mr-2">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-72 h-10 mt-1 justify-between truncate",
                  error?.message && "border-red-500"
                )}
              >
                {field.value
                  ? options.find((option) => option.value === field.value)
                      ?.label
                  : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[90%]">
              <DrawerHeader>
                <DrawerTitle>Selecione uma opção</DrawerTitle>
                <DrawerDescription>
                  Escolha da lista abaixo ou pesquise por uma opção.
                </DrawerDescription>
              </DrawerHeader>
              <Command shouldFilter={false} className="px-4">
                <CommandInput
                  placeholder="Pesquisar..."
                  value={searchValue}
                  onValueChange={(value) =>
                    setSearchValue(normalizeString(value))
                  }
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                  <CommandGroup>
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          field.onChange(
                            currentValue === field.value ? "" : currentValue
                          );
                          setOpen(false);
                          setSearchValue("");
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
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
              <DrawerFooter className="mb-3">
                <DrawerClose asChild>
                  <Button variant="secondary" className="h-12">
                    Fechar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      />
    </div>
  );
}
