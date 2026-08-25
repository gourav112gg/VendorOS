import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white shadow-sm shadow-black/5 hover:bg-emerald-700 active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-sm shadow-black/5 hover:bg-red-700 active:scale-[0.98]",
        outline:
          "border border-[#333333] bg-[#111111] text-white shadow-sm shadow-black/5 hover:bg-[#1A1A1A] hover:border-[#444444]",
        secondary:
          "bg-[#1A1A1A] text-[#E5E5E5] border border-[#2A2A2A] shadow-sm shadow-black/5 hover:bg-[#252525]",
        ghost: "hover:bg-white/5 text-[#A1A1AA] hover:text-white",
        link: "text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs uppercase tracking-wider font-semibold",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
