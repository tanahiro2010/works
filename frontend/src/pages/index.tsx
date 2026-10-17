import slidesData from "../../../slides.json";

type Slide = {
  name: string;
  slug: string;
  date: string;
  path: string;
  renderer: string;
};

// 一覧はグループを混ぜて新しい順に並べる。marp か ippon かは読む側には関係ないので出さない。
const slides: Slide[] = Object.values(slidesData)
  .flatMap((group) => group.slides as Slide[])
  .sort((a, b) => b.date.localeCompare(a.date));

const formatDate = (date: string) =>
  date ? date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1.$2.$3") : "";

const Index = () => (
  <main className="mx-auto max-w-3xl px-6 py-20 sm:px-8 sm:py-28">
    <header className="mb-16 sm:mb-24">
      <p className="eyebrow">Slides</p>
      <h1 className="mt-4 text-5xl sm:text-6xl">tanahiro2010</h1>
      <p className="mt-6 max-w-prose text-[var(--color-muted)]">
        これまでに登壇・発表したスライドの一覧です。全{slides.length}件。
      </p>
    </header>

    <ul className="border-t border-[var(--color-line)]">
      {slides.map((slide) => (
        <li key={slide.slug} className="border-b border-[var(--color-line)]">
          <a
            href={slide.path}
            className="group flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:gap-8"
          >
            <time
              dateTime={slide.date}
              className="shrink-0 font-mono text-sm tabular-nums text-[var(--color-muted)] sm:w-24"
            >
              {formatDate(slide.date)}
            </time>
            <span className="link-underline relative font-serif text-xl leading-snug group-hover:text-[var(--color-accent)] sm:text-2xl">
              {slide.name}
            </span>
          </a>
        </li>
      ))}
    </ul>
  </main>
);

export { Index };
