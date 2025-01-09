import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import useDebounce from "../Hooks/useDebounce";
import {
  FILTER_INIT,
  FULFILLED,
  GUARDIAN_API_KEY,
  NEW_YORK_TIMES,
  NEWS_DATA_IO,
  NEWSDATA_IO,
  THE_GUARDIAN,
  WORLD_NEWS_API,
} from "../Utils/constants";
import { returnAggregatedNewsData } from "../Utils/helpers";

const NewsAggregator = () => {
  const [articles, setArticles] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState(FILTER_INIT);
  const debouncedKeyword = useDebounce(keyword, 1000);

  // Fetch articles from the APIs
  const fetchArticles = useCallback(async () => {
    try {
      const responses = await Promise.allSettled([
        axios.get(
          `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_IO}&q=${debouncedKeyword}`
        ),
        axios.get(
          `https://content.guardianapis.com/search?q=${debouncedKeyword}&api-key=${GUARDIAN_API_KEY}`
        ),
        axios.get(
          `https://api.worldnewsapi.com/search-news?text=${debouncedKeyword}&language=en`,
          { headers: { "x-api-key": WORLD_NEWS_API } }
        ),
      ]);

      const newsDataIoArticles =
        responses[0].status === FULFILLED
          ? returnAggregatedNewsData(
              NEWS_DATA_IO,
              responses[0].value.data?.results
            )
          : [];
      const guardianArticles =
        responses[1].status === FULFILLED
          ? returnAggregatedNewsData(
              THE_GUARDIAN,
              responses[1].value.data.response.results
            )
          : [];
      const nytArticles =
        responses[2].status === FULFILLED
          ? returnAggregatedNewsData(
              NEW_YORK_TIMES,
              responses[2].value.data?.news
            )
          : [];

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
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      return (
        (!filters.source || article.source === filters.source) &&
        (!filters.date || article.publishedAt.startsWith(filters.date))
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

        <input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, date: e.target.value }))
          }
        />
        <button onClick={(e)=> {
          setFilters((preVal) => {
            return {
              ...preVal,
              date: ""
            }
          })
        }}>Reset date</button>
        
        <button onClick={(e) => {
          setFilters(FILTER_INIT)
        }}>Reset all</button> 
      </div>

      {/* Articles List */}
      <ul>
        {filteredArticles.map((article, index) => {
          return (
            <li key={index}>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>{" "}
              - <em>{article.source}</em>
            </li>
          )
        })}
      </ul>
    </div>
  );
};

export default NewsAggregator;
