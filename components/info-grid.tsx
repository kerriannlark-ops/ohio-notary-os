interface InfoGridProps {
  items: { title: string; body: string }[];
}

export function InfoGrid({ items }: InfoGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="rounded-[24px] bg-parchment/85 p-5">
          <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-walnut/75">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
