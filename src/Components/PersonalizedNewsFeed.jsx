import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  CATEGORIES,
  NEWS_DATA_IO,
  THE_GUARDIAN,
  NEW_YORK_TIMES,
  MEDIA_STACK,
  WORLD_NEWS_API,
  FULFILLED,
} from "../Utils/constants";
import { returnAggregatedNewsData } from "../Utils/helpers";

const PersonalizedNewsFeed = () => {
  const [preferredSources, setPreferredSources] = useState([]);
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [preferredAuthors, setPreferredAuthors] = useState([]);
  const [articles, setArticles] = useState([]);

  const availableSources = [NEWS_DATA_IO, THE_GUARDIAN, NEW_YORK_TIMES];
  const availableAuthors = ["Author 1", "Author 2", "Author 3"]; // Replace with real data if available.

  // Fetch articles based on preferences
  const fetchArticles = useCallback(async () => {
    try {
      const responses = await Promise.allSettled([
        axios.get(`https://newsdata.io/api/1/latest?apikey=${MEDIA_STACK}`),
        axios.get(`https://api.mediastack.com/v1/news?access_key=${MEDIA_STACK}`),
        axios.get(
          `https://api.worldnewsapi.com/search-news?text=&language=en`,
          { headers: { "x-api-key": WORLD_NEWS_API } }
        ),
      ]);

      const newsDataIoArticles =
        responses[0].status === FULFILLED
          ? returnAggregatedNewsData(NEWS_DATA_IO, responses[0].value.data?.results)
          : [];
      const mediaStackArticles =
        responses[1].status === FULFILLED
          ? returnAggregatedNewsData(THE_GUARDIAN, responses[1].value.data?.data)
          : [];
      const worldNewsArticles =
        responses[2].status === FULFILLED
          ? returnAggregatedNewsData(NEW_YORK_TIMES, responses[2].value.data?.news)
          : [];

      const allArticles = [...newsDataIoArticles, ...mediaStackArticles, ...worldNewsArticles];

      // Filter based on preferences
      const filteredArticles = allArticles.filter((article) => {
        return (
          (preferredSources.length === 0 || preferredSources.includes(article.source)) &&
          (preferredCategories.length === 0 ||
            article.category.some((cat) => preferredCategories.includes(cat))) &&
          (preferredAuthors.length === 0 || preferredAuthors.includes(article.author))
        );
      });

      setArticles(filteredArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  }, [preferredSources, preferredCategories, preferredAuthors]);

  // Fetch articles when preferences change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div>
      <h2>Personalized News Feed</h2>

      {/* Preferences */}
      <div>
        <h3>Preferred Sources</h3>
        {availableSources.map((source) => (
          <label key={source}>
            <input
              type="checkbox"
              value={source}
              checked={preferredSources.includes(source)}
              onChange={(e) => {
                const value = e.target.value;
                setPreferredSources((prev) =>
                  prev.includes(value)
                    ? prev.filter((s) => s !== value)
                    : [...prev, value]
                );
              }}
            />
            {source}
          </label>
        ))}

        <h3>Preferred Categories</h3>
        {CATEGORIES.map((category) => (
          <label key={category}>
            <input
              type="checkbox"
              value={category}
              checked={preferredCategories.includes(category)}
              onChange={(e) => {
                const value = e.target.value;
                setPreferredCategories((prev) =>
                  prev.includes(value)
                    ? prev.filter((c) => c !== value)
                    : [...prev, value]
                );
              }}
            />
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </label>
        ))}

        <h3>Preferred Authors</h3>
        {availableAuthors.map((author) => (
          <label key={author}>
            <input
              type="checkbox"
              value={author}
              checked={preferredAuthors.includes(author)}
              onChange={(e) => {
                const value = e.target.value;
                setPreferredAuthors((prev) =>
                  prev.includes(value)
                    ? prev.filter((a) => a !== value)
                    : [...prev, value]
                );
              }}
            />
            {author}
          </label>
        ))}
      </div>

      {/* Articles */}
      <div>
        <h3>Articles</h3>
        <ul>
          {articles.map((article, index) => (
            <li key={index}>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>{" "}
              - <em>{article.source}</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PersonalizedNewsFeed;
