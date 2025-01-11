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

const styles = {
  container: {
    padding: "1rem",
    fontFamily: "'Roboto', sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  searchInput: {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "1rem",
    fontSize: "1rem",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  filterSelect: {
    flex: "1",
    padding: "0.5rem",
  },
  filterDate: {
    flex: "1",
    padding: "0.5rem",
  },
  resetButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  addPreferenceButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "1rem",
  },
  preferencesList: {
    marginBottom: "1rem",
    listStyle: "none",
    padding: "0",
  },
  preferenceItem: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #ccc",
  },
  loadingText: {
    textAlign: "center",
    color: "#777",
  },
  errorText: {
    textAlign: "center",
    color: "#f44336",
  },
  articlesList: {
    listStyle: "none",
    padding: "0",
  },
  articleItem: {
    padding: "1rem",
    borderBottom: "1px solid #ccc",
  },
  articleLink: {
    color: "#2196f3",
    textDecoration: "none",
    fontWeight: "bold",
  },
  starButton: {
    marginLeft: "0.5rem",
    padding: "0.2rem 0.5rem",
    backgroundColor: "#ff9800",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

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
    <div style={styles.container}>
      <h1 style={styles.title}>News Aggregator</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search articles..."
        style={styles.searchInput}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={filters.source}
          style={styles.filterSelect}
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
          style={styles.filterDate}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, date: e.target.value }))
          }
        />
        <button
          style={styles.resetButton}
          onClick={() => setFilters((prev) => ({ ...prev, date: "" }))}
        >
          Reset Date
        </button>

        <select
          value={filters.category}
          style={styles.filterSelect}
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
        <button style={styles.resetButton} onClick={() => setFilters(FILTER_INIT)}>
          Reset All
        </button>
      </div>

      <button
        style={styles.addPreferenceButton}
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

      <ul style={styles.preferencesList}>
        {preferences.map((pref, index) => (
          <li key={index} style={styles.preferenceItem}>
            Name: Pref-{index + 1} | Source: {pref.source || "All"} | Category:{" "}
            {pref.category || "All"} | Starred Authors:{" "}
            {pref.starredAuthors.join(", ") || "None"}
          </li>
        ))}
      </ul>

      {loading && <p style={styles.loadingText}>Loading articles...</p>}
      {error && <p style={styles.errorText}>Error fetching articles: {error.message}</p>}

      <ul style={styles.articlesList}>
        {filteredArticles.map((article, index) => {
          const activePreference = preferences.find(
            (pref) =>
              pref.source === filters.source && pref.category === filters.category
          );

          const isAuthorStarred =
            activePreference?.starredAuthors.includes(article.authors[0]);

          return (
            <li key={index} style={styles.articleItem}>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.articleLink}
              >
                {article.title}
              </a>{" "}
              - <em>{article.source}</em> -{" "}
              <em>
                {article.authors.map((author, i) => (
                  <span key={i}>
                    {author}{" "}
                    <button
                      style={styles.starButton}
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
  );
};


export default NewsAggregator;
