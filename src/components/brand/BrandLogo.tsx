import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "horizontal" | "monogram" | "wordmark";
  href?: string;
  className?: string;
  priority?: boolean;
};

function LogoImage({
  variant,
  className,
  priority,
}: Pick<BrandLogoProps, "variant" | "className" | "priority">) {
  if (variant === "monogram") {
    return (
      <Image
        src="/brand/unique-monogram.svg"
        alt="UNIQUE"
        width={72}
        height={72}
        priority={priority}
        className={className}
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={`brand-wordmark ${className ?? ""}`} aria-label="UNIQUE">
        UNIQUE
      </span>
    );
  }

  return (
    <Image
      src="/brand/unique-logo-horizontal.svg"
      alt="UNIQUE - Uma extensão da Zara"
      width={320}
      height={180}
      priority={priority}
      className={className}
    />
  );
}

export default function BrandLogo({
  variant = "horizontal",
  href,
  className,
  priority,
}: BrandLogoProps) {
  const logo = (
    <LogoImage variant={variant} className={className} priority={priority} />
  );

  if (!href) return logo;

  return (
    <Link href={href} aria-label="UNIQUE">
      {logo}
    </Link>
  );
}
