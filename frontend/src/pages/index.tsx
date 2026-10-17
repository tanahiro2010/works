import slidesData from "../../../slides.json";

type Slide = {
  name: string;
  slug: string;
  date: string;
  updated: string;
  path: string;
};

/** slides.json のグループ。キーは build.js が決めている。 */
const groups = slidesData as unknown as Record<string, { slides: Slide[] }>;

/** 見出しと注釈。レンダラが違うと操作感も違うので、そこを先に断っておく。 */
const SECTIONS = [
  {
    key: "slides",
    heading: "Slides",
    note: "ippon 製。ページ送りにアニメーションがある。",
  },
  {
    key: "speakerdecks",
    heading: "SpeakerDeck",
    note: "Marp 製。アニメーションなしの静的なスライド。",
  },
] as const;

/** 最近さわったものが先頭。同時刻なら発表日が新しい方を先に。 */
const byUpdated = (a: Slide, b: Slide) =>
  b.updated.localeCompare(a.updated) || b.date.localeCompare(a.date);

const sections = SECTIONS.map(({ key, heading, note }) => ({
  heading,
  note,
  slides: [...(groups[key]?.slides ?? [])].sort(byUpdated),
})).filter((section) => section.slides.length > 0);

/** 「メインタイトル――サブタイトル」は一覧ではメインだけ出す。 */
const mainTitle = (name: string) => name.split("――")[0].trim() || name;

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

    {sections.map((section) => (
      <section key={section.heading}>
        <h2>{section.heading}</h2>
        <p className="section-note">{section.note}</p>
        <ul className="slide-list">
          {section.slides.map((slide) => (
            <li key={slide.slug}>
              <a href={slide.path}>{mainTitle(slide.name)}</a>{" "}
              <span className="meta">{slide.date}</span>
            </li>
          ))}
        </ul>
      </section>
    ))}

    <footer>© tanahiro2010</footer>
  </main>
);

export { Index };
