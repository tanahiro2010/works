import articlesData from "../data/articles.json";

type Article = {
  slug: string;
  title: string;
  /** frontmatter の summary。一覧と OGP はこちらを優先する。 */
  summary: string;
  date: string;
  description: string;
  path: string;
};

/** 一覧に出す見出し。長い本タイトルより summary の方が一覧では読みやすい。 */
const listTitle = (article: Article) => article.summary || article.title;

const articles: Article[] = articlesData.articles;

/** 年ごとに切る。記事が増えても見出しが自然に増えていく。 */
const byYear = articles.reduce<Record<string, Article[]>>((acc, article) => {
  const year = article.date.slice(0, 4) || "Undated";
  (acc[year] ??= []).push(article);
  return acc;
}, {});

const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

const Index = () => (
  <main>
    <h1>Blog</h1>
    <p>tanahiro2010 が書いたもの</p>
    <ul>
      <li>
        <a href="https://tanahiro2010.com">Website</a>
      </li>
      <li>
        <a href="https://slides.tanahiro2010.com">Slides</a>
      </li>
      <li>
        <a href="https://github.com/tanahiro2010">GitHub</a>
      </li>
    </ul>

    {articles.length === 0 ? (
      <p className="empty">まだ公開記事がありません。</p>
    ) : (
      years.map((year) => (
        <section key={year}>
          <h2>{year}</h2>
          <ul className="slide-list">
            {byYear[year].map((article) => (
              <li key={article.slug}>
                <a href={article.path}>{listTitle(article)}</a>{" "}
                <span className="meta">{article.date}</span>
              </li>
            ))}
          </ul>
        </section>
      ))
    )}

    <footer>© tanahiro2010</footer>
  </main>
);

export { Index };
