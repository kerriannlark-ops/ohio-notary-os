import Link from "next/link";

interface PublicHeroProps {
  title: string;
  subtitle: string;
  primaryHref?: string;
  secondaryHref?: string;
}

export function PublicHero({
  title,
  subtitle,
  primaryHref = "/book-now",
  secondaryHref = "/pricing",
}: PublicHeroProps) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white/80 px-5 py-8 shadow-card backdrop-blur sm:rounded-[32px] sm:px-6 sm:py-10 lg:px-10">
      <p className="text-xs uppercase tracking-[0.28em] text-rust">Public booking</p>
      <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-tight text-ink sm:leading-none md:text-5xl xl:text-6xl 2xl:text-7xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-walnut/78 sm:text-base">{subtitle}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href={primaryHref}
          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-parchment"
        >
          Book Now
        </Link>
        <Link
          href={secondaryHref}
          className="rounded-full border border-black/10 bg-parchment px-5 py-3 text-sm font-semibold text-walnut"
        >
          View Pricing
        </Link>
      </div>
    </section>
  );
}
