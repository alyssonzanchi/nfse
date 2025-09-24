import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export function TableCell(props: ComponentProps<"td">) {
  return (
    <td
      {...props}
      className={twMerge("py-3 px-4 text-sm text-zinc-300", props.className)}
    />
  );
}
