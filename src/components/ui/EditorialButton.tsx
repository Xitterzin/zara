import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "dark" | "light" | "outline";
};

const base =
  "inline-flex min-h-12 items-center justify-center border px-7 text-[11px] font-medium uppercase tracking-[0.26em] transition duration-300 disabled:pointer-events-none disabled:opacity-45";

const variants = {
  dark: "border-ink bg-ink text-paper hover:bg-transparent hover:text-ink",
  light: "border-paper bg-paper text-ink hover:bg-transparent hover:text-paper",
  outline: "border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
};

export default function EditorialButton({
  href,
  variant = "dark",
  className = "",
  children,
  ...props
}: Props) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
