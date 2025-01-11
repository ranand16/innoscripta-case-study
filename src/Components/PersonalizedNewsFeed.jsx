import React, { useState, useMemo } from "react";
import useFetchArticles from "../Hooks/useFetchArticles";
import { useFavoritesStore } from "../Hooks/useFavoritesStore";
import { hasIntersection } from "../Utils/helpers";

const PersonalizedNewsFeed = () => {
  const { preferences } = useFavoritesStore((state) => state);
  const { articles, loading, error, fetchArticles } = useFetchArticles("");
  // console.log("latest articles ", articles);
  
  const [activeTab, setActiveTab] = useState(0);

  // Refresh the feed
  const handleRefresh = () => {
    fetchArticles();
  };

// Filter articles based on the active preference
const filteredArticles = useMemo(() => {

  return articles.filter((article) => {
    const preference = preferences[activeTab];
    // console.log(preference, " compare ~~~~~~ with ", article);
    if (!preference) return true;

    // console.log(article.source, " === ", preference.source);
    // console.log(
    //   !preference.category,
    //   " ~~~~~ ",
    //   article.category.includes(preference.category)
    // );
    // console.log(
    //   !preference.starredAuthors.length,
    //   " ~~~~~ ",
    //   preference.starredAuthors,
    //   "  has  ",
    //   article.authors
    // );

    const matchesSource =
      !preference.source || article.source === preference.source;
    const matchesCategory =
      !preference.category || article.category.includes(preference.category);
    const matchesStarredAuthors =
      !preference.starredAuthors.length ||
      hasIntersection(preference.starredAuthors, article.authors);

    return matchesSource && matchesCategory && matchesStarredAuthors;
  });
}, [articles, preferences, activeTab]);

  console.log(preferences);
  
  return (
    <div>
      <h1>Personalized News Feed</h1>

      {/* Tabs for preferences */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {preferences.map((preference, index) => (
          <button
            key={index}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: activeTab === index ? "#007bff" : "#f8f9fa",
              color: activeTab === index ? "white" : "black",
              border: "1px solid #007bff",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab(index)}
          >
            {preference.source || "All Sources"} - {preference.category || "All Categories"}
          </button>
        ))}
      </div>

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Refresh Feed
      </button>

      {/* Loading and Error States */}
      {loading && <p>Loading articles...</p>}
      {error && <p>Error fetching articles: {error.message}</p>}

      {/* Articles List */}
      <ul>
        {filteredArticles.map((article, index) => (
          <li key={index}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
            <p>Source: {article.source}</p>
            <p>Author: {article.authors || "Unknown"}</p>
            <p>Category: {article.category || "General"}</p>
            <p>Published: {article.publishedAt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonalizedNewsFeed;
