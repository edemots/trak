"use client";

import type { AnyFieldApi } from "@tanstack/react-form";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPicker as EmojiPickerRoot,
  EmojiPickerSearch,
} from "./ui/emoji-picker";

export default function EmojiPicker({
  field,
  autoFocus,
}: {
  field: AnyFieldApi;
  autoFocus?: boolean;
}) {
  const [open, setOpen] = useState(autoFocus ?? false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-expanded={open}
            autoFocus={autoFocus}
            className="mt-2"
            role="combobox"
            size="icon"
            variant="outline"
          >
            {field.state.value}
          </Button>
        }
      />
      <PopoverContent align="start" className="aspect-square w-auto overflow-hidden p-0">
        <EmojiPickerRoot
          locale="fr"
          onEmojiSelect={({ emoji }) => {
            setOpen(false);
            field.handleChange(emoji);
          }}
        >
          <EmojiPickerSearch placeholder="Rechercher un émoji" />
          <EmojiPickerContent />
          <EmojiPickerFooter />
        </EmojiPickerRoot>
      </PopoverContent>
    </Popover>
  );
}
