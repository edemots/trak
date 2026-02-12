"use client";

import type { AnyFieldApi } from "@tanstack/react-form";

import { debounce } from "@tanstack/react-pacer";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { Fragment, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Command, CommandInput, CommandList } from "./ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const iconKeys = iconNames;

const SPLIT_BY_HYPHENS_REGEX = /-/;

export default function IconCombobox({ field }: { field: AnyFieldApi }) {
  const [open, setOpen] = useState(false);
  const [filteredIconKeys, setFilteredIconKeys] = useState(iconKeys);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: Math.max(Math.floor(filteredIconKeys.length / 6), 1),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 6,
    gap: 8,
  });
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: 6,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 6,
    gap: 8,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    rowVirtualizer.scrollToIndex(0);
    columnVirtualizer.scrollToIndex(0);
    // Force a recalculation after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      rowVirtualizer.measure();
      columnVirtualizer.measure();
    }, 100);
    return () => clearTimeout(timer);
  }, [open, rowVirtualizer, columnVirtualizer]);

  const handleSearch = debounce(
    (search: string) => {
      setFilteredIconKeys(
        iconKeys.filter((option) =>
          option
            .split(SPLIT_BY_HYPHENS_REGEX)
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase() ?? ""),
        ),
      );
    },
    { wait: 100 },
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-expanded={open}
            className="mt-2"
            role="combobox"
            size="icon"
            variant="outline"
          >
            <DynamicIcon name={field.state.value} />
          </Button>
        }
      />
      <PopoverContent align="start" className="aspect-square w-auto overflow-hidden p-0">
        <Command className="**:data-[slot=command-input-wrapper]:p-0" shouldFilter={false}>
          <CommandInput onValueChange={handleSearch} placeholder="Rechercher une icône..." />
          <CommandList className="p-2.5" ref={parentRef}>
            <div
              className="relative"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: `${columnVirtualizer.getTotalSize()}px`,
              }}
            >
              <TooltipProvider delay={200}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  return (
                    <Fragment key={virtualRow.key}>
                      {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                        const iconName =
                          filteredIconKeys[virtualRow.index * 6 + virtualColumn.index];

                        if (!iconName) {
                          return;
                        }

                        return (
                          <Tooltip key={virtualColumn.key}>
                            <TooltipTrigger
                              render={
                                <Button
                                  onClick={() =>
                                    field.handleChange(
                                      filteredIconKeys[virtualRow.index * 6 + virtualColumn.index],
                                    )
                                  }
                                  size="icon"
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: `${virtualColumn.size}px`,
                                    height: `${virtualRow.size}px`,
                                    transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                                  }}
                                  variant="outline"
                                >
                                  <DynamicIcon name={iconName} />
                                </Button>
                              }
                            />
                            <TooltipContent>
                              {filteredIconKeys[virtualRow.index * 6 + virtualColumn.index]}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </TooltipProvider>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
