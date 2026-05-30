import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const baseClassName =
  "inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm tracking-[0.08em] transition duration-300 ease-out hover:-translate-y-0.5";

const variants = {
  primary:  "border-leather bg-leather text-canvas hover:bg-leather/85",
  secondary: "border-ink/12 bg-ink/5 text-ink hover:bg-ink/10",
  ghost:    "border-ink/15 bg-transparent text-ink hover:bg-ink/8",
  outline:  "border-canvas/25 bg-transparent text-canvas hover:bg-canvas/10",
  light:    "border-noir/10 bg-noir text-canvas hover:bg-noir/85"
} as const;

type ButtonProps = {
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps) {
  return (
    <button className={cn(baseClassName, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & ButtonProps & { href: string }) {
  return (
    <Link href={href} className={cn(baseClassName, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
