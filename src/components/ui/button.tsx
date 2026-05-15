import Link from "next/link";
import { cloneElement, isValidElement } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "icon";
  asChild?: false;
};

type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  asChild: true;
  href?: string;
};

const variants = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary: "bg-accent text-accent-foreground hover:bg-accent/80",
  outline: "border bg-white shadow-sm hover:bg-muted",
  ghost: "hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  icon: "size-10 p-0"
};

export function Button(props: ButtonProps | AnchorButtonProps) {
  const { className, variant = "default", size = "md", asChild, ...rest } = props;
  const classes = cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (asChild) {
    const anchorProps = rest as AnchorButtonProps;
    if (isValidElement(anchorProps.children)) {
      return cloneElement(anchorProps.children, {
        className: cn(classes, (anchorProps.children.props as { className?: string }).className)
      } as { className: string });
    }
    const { href = "#", ...linkProps } = anchorProps;
    return <Link href={href} className={classes} {...linkProps} />;
  }

  return <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} />;
}
