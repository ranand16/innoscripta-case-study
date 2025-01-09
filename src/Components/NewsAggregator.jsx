import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useDebounce from "../Hooks/useDebounce";
import { GUARDIAN_API_KEY, NEW_YORK_TIMES, NEWS_DATA_IO, NEWSDATA_IO, THE_GUARDIAN, WORLD_NEWS_API } from "../Utils/constants";
import { returnAggregatedNewsData } from "../Utils/helpers";

const NewsAggregator = () => {
  const [articles, setArticles] = useState([]);
  const [keyword, setKeyword] = useState(""); // keyword 
  const [filters, setFilters] = useState({ source: "" }); // by default adding source and fate as the fuklter
  const debouncedKeyword = useDebounce(keyword, 1000); // keyword to debouncedKeyword
  console.log("debouncedKeyword::: ", debouncedKeyword, " ::: keyword::: ", keyword);
  
  // Fetch articles from the APIs
  const fetchArticles = useCallback(async () => {
    try {
      const responses = await Promise.all([
        axios.get(`https://newsdata.io/api/1/latest?apikey=${NEWSDATA_IO}&q=${debouncedKeyword}`),
        axios.get(`https://content.guardianapis.com/search?q=${debouncedKeyword}&api-key=${GUARDIAN_API_KEY}`),
        axios.get(`https://api.worldnewsapi.com/search-news?text=${debouncedKeyword}&language=en`, { headers: { 'x-api-key': WORLD_NEWS_API } }),
      ]);

      const [newsDataIo, guardianData, nytData] = responses;
      // Normalize articles from all the sources
      const newsDataIoArticles = returnAggregatedNewsData(NEWS_DATA_IO, newsDataIo.data?.results)
      const guardianArticles = returnAggregatedNewsData(THE_GUARDIAN, guardianData.data.response.results)
      const nytArticles = returnAggregatedNewsData(NEW_YORK_TIMES, nytData.data?.news)

      // Combine all articles
      setArticles([...newsDataIoArticles, ...guardianArticles, ...nytArticles]);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  }, [debouncedKeyword]);

  // Fetch articles when debouncedKeyword changes
  useEffect(() => {
    if (debouncedKeyword) {
      fetchArticles();
    }
  }, [debouncedKeyword, fetchArticles]);

  // Filter articles
  const applyFilters = () => {
    return articles.filter((article) => {
      return (
        (!filters.source || article.source === filters.source) 
        // && (!filters.date || article.publishedAt.startsWith(filters.date))
      );
    });
  };

  const filteredArticles = applyFilters();

  return (
    <div>
      <h1>News Aggregator</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search articles..."
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
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
          <option value={NEWS_DATA_IO}>{NEWS_DATA_IO}</option>
          <option value={THE_GUARDIAN}>{THE_GUARDIAN}</option>
          <option value={NEW_YORK_TIMES}>{NEW_YORK_TIMES}</option>
        </select>

        {/* <input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, date: e.target.value }))
          }
        /> */}
      </div>

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
