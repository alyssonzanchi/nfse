import { ComponentProps } from "react";

export function TableRow(props: ComponentProps<"tr">) {
  return (
    <tr className="border-b border-white/10 hover:bg-white/10" {...props} />
  );
}
