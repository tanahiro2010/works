import slidesData from "../../../slides.json";

type Slide = {
  name: string;
  slug: string;
  date: string;
  path: string;
};

const slides: Slide[] = Object.values(slidesData)
  .flatMap((group) => group.slides as Slide[])
  .sort((a, b) => b.date.localeCompare(a.date));

/** 年ごとに切る。デッキが増えても見出しが自然に増えていく。 */
const byYear = slides.reduce<Record<string, Slide[]>>((acc, slide) => {
  const year = slide.date.slice(0, 4) || "Undated";
  (acc[year] ??= []).push(slide);
  return acc;
}, {});

const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

const Index = () => (
  <main>
    <h1>Slides</h1>
    <p>tanahiro2010 の登壇・発表資料</p>
    <ul>
      <li>
        <a href="https://tanahiro2010.com">Website</a>
      </li>
      <li>
        <a href="https://x.com/tanahiro2010">X</a>
      </li>
      <li>
        <a href="https://github.com/tanahiro2010/slides">GitHub</a>
      </li>
    </ul>

    {years.map((year) => (
      <section key={year}>
        <h2>{year}</h2>
        <ul className="slide-list">
          {byYear[year].map((slide) => (
            <li key={slide.slug}>
              <a href={slide.path}>{slide.name}</a> <span className="meta">{slide.date}</span>
            </li>
          ))}
        </ul>
      </section>
    ))}

    <footer>© tanahiro2010</footer>
  </main>
);

export { Index };
