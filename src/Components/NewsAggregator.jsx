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

const NewsAggregator = () => {
  const [keyword, setKeyword] = useState(""); // the keyword as you enter this is updated
  const [filters, setFilters] = useState(FILTER_INIT); // all the filters applied right now, default as well 
  const debouncedKeyword = useDebounce(keyword, 1000); // the keyword with added debounce 

  const { articles, loading, error } = useFetchArticles(debouncedKeyword); // fetching articels along with loader and error 

  const { addPreference, removeAuthorFromPreference, preferences } =
    useFavoritesStore((s) => s); // saving preference or feed preference...you can add as many a syou want here

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      return (
        (!filters.source || article.source === filters.source) &&
        (!filters.date || article.publishedAt.startsWith(filters.date)) &&
        (!filters.category || article.category.includes(filters.category))
      );
    });
  }, [articles, filters]); // filtering articles and memoizing it to prevent waste re renders 

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
        {/* Source Filter */}
        <select
          value={filters.source}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, source: e.target.value }))
          }
        >
          <option value="">All Sources</option>
          <option value={NEWS_DATA_IO}>{NEWS_DATA_IO}</option>
          <option value={THE_GUARDIAN}>{THE_GUARDIAN}</option>
          <option value={NEW_YORK_TIMES}>{NEW_YORK_TIMES}</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, date: e.target.value }))
          }
        />

        {/* Reset the date only */}
        <button
          onClick={() => setFilters((prev) => ({ ...prev, date: "" }))}
        >
          Reset date
        </button>

        {/* Category dilter */}
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
      {/* This preference is used in the personalized component to create different types of feed for any user */}
      <button
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
        {filteredArticles.map((article, index) => {
          const activePreference = preferences.find(
            (pref) =>
              pref.source === filters.source &&
              pref.category === filters.category
          );

          // checking if the active preference has this author 
          const isAuthorStarred =
            activePreference?.starredAuthors.includes(article.authors[0]);

          return (
            <li key={index}>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>{" "}
              - <em>{article.source}</em> -{" "}
              <em>
                {article.authors.map((author, i) => (
                  <span key={i}>
                    {author}{" "}
                    <button
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
