import articlesData from "../data/articles.json";

type Article = {
  slug: string;
  title: string;
  date: string;
  description: string;
  path: string;
};

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
                <a href={article.path}>{article.title}</a>{" "}
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
