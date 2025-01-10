import React, { useState, useMemo } from "react";
import useDebounce from "../Hooks/useDebounce";
import useFetchArticles from "../Hooks/useFetchArticles";
import { FILTER_INIT, CATEGORIES, NEWS_DATA_IO, THE_GUARDIAN, NEW_YORK_TIMES } from "../Utils/constants";
import { useFavoritesStore } from "../Hooks/useFavoritesStore";

const NewsAggregator = () => {
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState(FILTER_INIT);
  const debouncedKeyword = useDebounce(keyword, 1000);

  const { articles, loading, error } = useFetchArticles(debouncedKeyword);

  const { starredAuthors, addAuthor, removeAuthor, addPreference, preferences } = useFavoritesStore((s) => s);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article, i) => {
      return (
        (!filters.source || article.source === filters.source) &&
        (!filters.date || article.publishedAt.startsWith(filters.date)) &&
        (!filters.category || article.category.includes(filters.category))
      );
    });
  }, [articles, filters]);

  return (
    <div>
      <h1>News Aggregator</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search articles..."
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* Filters */}
      <div>
        <select
          value={filters.source}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, source: e.target.value }))
          }
        >
          <option value="">All Sources</option>
          <option value={NEWS_DATA_IO}>News Data IO</option>
          <option value={THE_GUARDIAN}>The Guardian</option>
          <option value={NEW_YORK_TIMES}>New York Times</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, date: e.target.value }))
          }
        />
        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, date: "" }))
          }
        >
          Reset date
        </button>

        <select
          value={filters.category}
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
        <button onClick={() => setFilters(FILTER_INIT)}>Reset all</button>
      </div>

      {/* Add Preference */}
      <button
        onClick={() =>
          addPreference({
            source: filters.source,
            starredAuthors,
            category: filters.category,
          })
        }
      >
        Add Preference
      </button>

      {/* Display Preferences */}
      <ul>
        {preferences.map((pref, index) => (
          <li key={index}>
            Name: Pref-{index + 1} | Source: {pref.source || "All"} | Category:{" "}
            {pref.category || "All"} | Starred Authors:{" "}
            {pref.starredAuthors.join(", ") || "None"}
          </li>
        ))}
      </ul>

      {/* Loading/Error */}
      {loading && <p>Loading articles...</p>}
      {error && <p>Error fetching articles: {error.message}</p>}

      {/* Articles List */}
      <ul>
        {filteredArticles.map((article, index) => (
          <li key={index}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>{" "}
            - <em>{article.source}</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsAggregator;
