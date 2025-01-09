import { NEW_YORK_TIMES, NEWS_DATA_IO, THE_GUARDIAN } from "./constants";

export const returnAggregatedNewsData = (source, data) => {
  const uniqueArticles = new Map(); // To store unique articles by title

  const articles = data.map((article) => {
    switch (source) {
      case NEWS_DATA_IO:
        return {
          id: article.article_id,
          source: NEWS_DATA_IO,
          title: article.title,
          url: article.link,
          publishedAt: article.pubDate,
          category:
            article.category && article.category.length > 0
              ? [...article.category]
              : ["general"],
          authors:
            article.creator && article.creator.length > 0
              ? [...article.creator]
              : ["anonymous"],
        };
      case THE_GUARDIAN:
        return {
          source: THE_GUARDIAN,
          title: article.title,
          url: article.url,
          publishedAt: article.published_at,
          category: article.category ? [article.category] : ["general"],
          authors: article.author ? [article.author] : ["anonymous"],
        };
      case NEW_YORK_TIMES:
        return {
          source: NEW_YORK_TIMES,
          title: article.title,
          url: article.url,
          publishedAt: article.publish_date,
          category: article.sectionName ? [article.category] : ["general"],
          authors: article.authors ? [article.authors] : ["anonymous"],
        };
      default:
        return null;
    }
  });

  // Now we will filter duplicates based on unique titles
  articles.forEach((article) => {
    if (article && !uniqueArticles.has(article.title)) {
      uniqueArticles.set(article.title, article);
    }
  });

  return Array.from(uniqueArticles.values());
};
