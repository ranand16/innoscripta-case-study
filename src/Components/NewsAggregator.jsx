import React, { useState, useMemo } from "react";
import useDebounce from "../Hooks/useDebounce";
import useFetchArticles from "../Hooks/useFetchArticles";
import {
  FILTER_INIT,
  CATEGORIES,
  NEWS_DATA_IO,
  THE_GUARDIAN,
  NEW_YORK_TIMES,
} from "../Utils/constants";
import { useFavoritesStore } from "../Hooks/useFavoritesStore";
import "../NewAggregator.css"

const NewsAggregator = () => {
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState(FILTER_INIT);
  const debouncedKeyword = useDebounce(keyword, 1000);

  const { articles, loading, error } = useFetchArticles(debouncedKeyword);

  const { addPreference, removeAuthorFromPreference, preferences } =
    useFavoritesStore((s) => s);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      return (
        (!filters.source || article.source === filters.source) &&
        (!filters.date || article.publishedAt.startsWith(filters.date)) &&
        (!filters.category || article.category.includes(filters.category))
      );
    });
  }, [articles, filters]);

  return (
    <div className="news-container">
      <div className="news-preferences-container">
        <ul className="news-preferences-list">
          {preferences.map((pref, index) => (
            <li key={index} className="news-preference-item">
              <h3>Preference {index + 1}</h3>
              <p>
                <span>Source:</span> {pref.source || "All"}
              </p>
              <p>
                <span>Category:</span> {pref.category || "All"}
              </p>
              <p>
                <span>Starred Authors:</span>{" "}
                {pref.starredAuthors.join(", ") || "None"}
              </p>
            </li>
          ))}
        </ul>

      </div>

      <div>
        <h1 className="news-title">News Aggregator</h1>
        <input
          type="text"
          placeholder="Search articles..."
          className="news-search-input"
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div className="news-filters">
          <select
            value={filters.source}
            className="news-filter-select"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, source: e.target.value }))
            }
          >
            <option value="">All Sources</option>
            <option value={NEWS_DATA_IO}>{NEWS_DATA_IO}</option>
            <option value={THE_GUARDIAN}>{THE_GUARDIAN}</option>
            <option value={NEW_YORK_TIMES}>{NEW_YORK_TIMES}</option>
          </select>

          <input
            type="date"
            value={filters.date}
            className="news-filter-date"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          <button
            className="news-reset-button"
            onClick={() => setFilters((prev) => ({ ...prev, date: "" }))}
          >
            Reset Date
          </button>

          <select
            value={filters.category}
            className="news-filter-select"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <button
            className="news-reset-button"
            onClick={() => setFilters(FILTER_INIT)}
          >
            Reset All
          </button>
        </div>

        <button
          className="news-add-preference-button"
          onClick={() =>
            addPreference({
              source: filters.source,
              category: filters.category,
              starredAuthors: [],
            })
          }
        >
          Add Preference
        </button>


        {loading && <p className="news-loading-text">Loading articles...</p>}
        {error && (
          <p className="news-error-text">Error fetching articles: {error.message}</p>
        )}

        <ul className="news-articles-list">
          {filteredArticles.map((article, index) => {
            const activePreference = preferences.find(
              (pref) =>
                pref.source === filters.source &&
                pref.category === filters.category
            );

            const isAuthorStarred =
              activePreference?.starredAuthors.includes(article.authors[0]);

            return (
              <li key={index} className="news-article-item">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-article-link"
                >
                  {article.title}
                </a>{" "}
                - <em>{article.source}</em> -{" "}
                <em>
                  {article.authors.map((author, i) => (
                    <span key={i}>
                      {author}{" "}
                      <button
                        className="news-star-button"
                        onClick={() => {
                          if (isAuthorStarred) {
                            removeAuthorFromPreference(
                              author,
                              filters.source,
                              filters.category
                            );
                          } else {
                            addPreference({
                              source: filters.source,
                              category: filters.category,
                              starredAuthors: [
                                ...(activePreference?.starredAuthors || []),
                                author,
                              ],
                            });
                          }
                        }}
                      >
                        {isAuthorStarred ? "Unstar" : "Star"}
                      </button>
                    </span>
                  ))}
                </em>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default NewsAggregator;
