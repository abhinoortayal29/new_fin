// "use client";

// import * as React from "react";
// import "react-day-picker/lib/style.css"; // v7 CSS path (important!)

// import {
//   ChevronDownIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
// } from "lucide-react";
// import DayPicker from "react-day-picker";

// import { cn } from "@/lib/utils";
// import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Calendar wrapper that supports both:
 * - v7 DayPicker props (selectedDays, onDayClick, ...)
 * - v8-style props used by your form (mode="single", selected, onSelect)
 *
 * We map v8 -> v7 so you don't need to change the AddTransactionForm.
 */
// function Calendar({
//   className,
//   classNames: extraClassNames,
//   showOutsideDays = true,
//   captionLayout = "label",
//   buttonVariant = "ghost",
//   formatters,
//   components,
//   // Accept v8-style props and consume them here:
//   mode = "single", // "single" is what AddTransactionForm sends
//   selected, // v8 selected
//   onSelect, // v8 onSelect
//   onDayClick: onDayClickProp, // if someone passes native v7 prop
//   ...props
// }) {
//   const defaultClassNames = getDefaultClassNames();

//   // Create a single handler that calls both v8 onSelect and any v7 onDayClick passed
//   const handleDayClick = React.useCallback(
//     (day, modifiers, e) => {
//       // v8 form expects onSelect(day)
//       if (onSelect) {
//         onSelect(day);
//       }
//       // If someone passed v7 handler explicitly
//       if (typeof onDayClickProp === "function") {
//         onDayClickProp(day, modifiers, e);
//       }
//     },
//     [onSelect, onDayClickProp]
//   );

//   // Build props to pass to the v7 DayPicker.
//   // Map v8 selected -> v7 selectedDays
//   const dayPickerExtraProps = {};
//   if (mode === "single") {
//     if (selected !== undefined) {
//       dayPickerExtraProps.selectedDays = selected;
//     }
//     // prefer the v8 onSelect mapping if provided
//     if (onSelect) {
//       dayPickerExtraProps.onDayClick = handleDayClick;
//     } else if (onDayClickProp) {
//       dayPickerExtraProps.onDayClick = onDayClickProp;
//     }
//   } else if (mode === "range") {
//     // if user passed an array/range object as `selected`, map it too
//     if (selected !== undefined) {
//       dayPickerExtraProps.selectedDays = selected;
//     }
//     if (onSelect) {
//       // v8 onSelect for range might pass a range; still call onSelect with day for v7 compatibility
//       dayPickerExtraProps.onDayClick = handleDayClick;
//     } else if (onDayClickProp) {
//       dayPickerExtraProps.onDayClick = onDayClickProp;
//     }
//   } else {
//     // fallback: pass any explicit v7 onDayClick
//     if (onDayClickProp) dayPickerExtraProps.onDayClick = onDayClickProp;
//   }

//   return (
//     <DayPicker
//       showOutsideDays={showOutsideDays}
//       className={cn(
//         "bg-background group/calendar p-3 cell-size-8 [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
//         String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
//         String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
//         className
//       )}
//       captionLayout={captionLayout}
//       formatters={{
//         formatMonthDropdown: (date) =>
//           date.toLocaleString("default", { month: "short" }),
//         ...formatters,
//       }}
//       classNames={{
//         root: cn("w-fit", defaultClassNames.root),
//         months: cn(
//           "flex gap-4 flex-col md:flex-row relative",
//           defaultClassNames.months
//         ),
//         month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
//         nav: cn(
//           "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
//           defaultClassNames.nav
//         ),
//         button_previous: cn(
//           buttonVariants({ variant: buttonVariant }),
//           "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
//           defaultClassNames.button_previous
//         ),
//         button_next: cn(
//           buttonVariants({ variant: buttonVariant }),
//           "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
//           defaultClassNames.button_next
//         ),
//         month_caption: cn(
//           "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
//           defaultClassNames.month_caption
//         ),
//         dropdowns: cn(
//           "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
//           defaultClassNames.dropdowns
//         ),
//         dropdown_root: cn(
//           "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
//           defaultClassNames.dropdown_root
//         ),
//         dropdown: cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown),
//         caption_label: cn(
//           "select-none font-medium",
//           captionLayout === "label"
//             ? "text-sm"
//             : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
//           defaultClassNames.caption_label
//         ),
//         table: "w-full border-collapse",
//         weekdays: cn("flex", defaultClassNames.weekdays),
//         weekday: cn(
//           "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
//           defaultClassNames.weekday
//         ),
//         week: cn("flex w-full mt-2", defaultClassNames.week),
//         week_number_header: cn("select-none w-(--cell-size)", defaultClassNames.week_number_header),
//         week_number: cn(
//           "text-[0.8rem] select-none text-muted-foreground",
//           defaultClassNames.week_number
//         ),
//         day: cn(
//           "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
//           defaultClassNames.day
//         ),
//         range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
//         range_middle: cn("rounded-none", defaultClassNames.range_middle),
//         range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
//         today: cn(
//           "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
//           defaultClassNames.today
//         ),
//         outside: cn(
//           "text-muted-foreground aria-selected:text-muted-foreground",
//           defaultClassNames.outside
//         ),
//         disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
//         hidden: cn("invisible", defaultClassNames.hidden),
//         ...extraClassNames,
//       }}
//       components={{
//         Root: ({ className, rootRef, ...props }) => {
//           return (<div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />);
//         },
//         Chevron: ({ className, orientation, ...props }) => {
//           if (orientation === "left") {
//             return (<ChevronLeftIcon className={cn("size-4", className)} {...props} />);
//           }

//           if (orientation === "right") {
//             return (<ChevronRightIcon className={cn("size-4", className)} {...props} />);
//           }

//           return (<ChevronDownIcon className={cn("size-4", className)} {...props} />);
//         },
//         DayButton: CalendarDayButton,
//         WeekNumber: ({ children, ...props }) => {
//           return (
//             <td {...props}>
//               <div className="flex size-(--cell-size) items-center justify-center text-center">
//                 {children}
//               </div>
//             </td>
//           );
//         },
//         ...components,
//       }}
//       // pass the v7-compatible props we built above:
//       {...dayPickerExtraProps}
//       {...props}
//     />
//   );
// }

// function CalendarDayButton({
//   className,
//   day,
//   modifiers,
//   ...props
// }) {
//   const defaultClassNames = getDefaultClassNames();

//   const ref = React.useRef(null);
//   React.useEffect(() => {
//     if (modifiers.focused) ref.current?.focus();
//   }, [modifiers.focused]);

//   return (
//     <Button
//       ref={ref}
//       variant="ghost"
//       size="icon"
//       data-day={day.date.toLocaleDateString()}
//       data-selected-single={
//         modifiers.selected &&
//         !modifiers.range_start &&
//         !modifiers.range_end &&
//         !modifiers.range_middle
//       }
//       data-range-start={modifiers.range_start}
//       data-range-end={modifiers.range_end}
//       data-range-middle={modifiers.range_middle}
//       className={cn(
//         "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
//         defaultClassNames.day,
//         className
//       )}
//       {...props} />
//   );
// }

// export { Calendar, CalendarDayButton };
// export default Calendar;

"use client";

import * as React from "react";
import DayPicker from "react-day-picker";                // v7 default import
import "react-day-picker/lib/style.css";                 // v7 CSS

// Optional helpers from shadcn project — if you don't have them,
// replace cn with a simple join or remove.
import { cn } from "@/lib/utils";                        // optional
import { Button } from "@/components/ui/button";         // optional

/**
 * Calendar (v7) - single date selection
 * Props:
 * - selected: Date | undefined
 * - onSelect: function(day: Date)
 */
export default function Calendar({ className, selected, onSelect, ...props }) {
  const handleDayClick = React.useCallback(
    (day, modifiers, e) => {
      if (onSelect) onSelect(day);
    },
    [onSelect]
  );

  const dayPickerProps = {};
  if (selected) dayPickerProps.selectedDays = selected;
  dayPickerProps.onDayClick = handleDayClick;

  return (
    <div className={cn ? cn("bg-background p-3 rounded-lg", className) : className}>
      <DayPicker
        {...dayPickerProps}
        showOutsideDays
        {...props}
      />
    </div>
  );
}
