import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const baseClassName =
  "inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm tracking-[0.08em] transition duration-300 ease-out hover:-translate-y-0.5";

const variants = {
  primary: "border-gold bg-gold text-black hover:bg-[#d8bc84]",
  secondary: "border-white/16 bg-white/5 text-white hover:bg-white/10",
  ghost: "border-white/20 bg-transparent text-white hover:bg-white/8",
  light: "border-black/10 bg-black text-white hover:bg-black/85"
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
