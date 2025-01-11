import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  NEWSDATA_IO,
  MEDIA_STACK,
  WORLD_NEWS_API,
  FULFILLED,
  NEWS_DATA_IO,
  THE_GUARDIAN,
  NEW_YORK_TIMES,
} from "../Utils/constants";
import { returnAggregatedNewsData } from "../Utils/helpers";

const useFetchArticles = (debouncedKeyword) => {
  const [articles, setArticles] = useState(() => {
    // Load articles from localStorage on initial render
    const storedArticles = localStorage.getItem("articles");
    return storedArticles ? JSON.parse(storedArticles) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async () => {
    if (!debouncedKeyword) return;

    setLoading(true);
    setError(null);

    try {
      const responses = await Promise.allSettled([
        axios.get(
          `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_IO}&q=${debouncedKeyword}`
        ),
        axios.get(
          `https://api.mediastack.com/v1/news?access_key=${MEDIA_STACK}&keywords=${debouncedKeyword}`
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
              responses[1].value.data?.data
            )
          : [];
      const nytArticles =
        responses[2].status === FULFILLED
          ? returnAggregatedNewsData(
              NEW_YORK_TIMES,
              responses[2].value.data?.news
            )
          : [];

      const aggregatedArticles = [
        ...newsDataIoArticles,
        ...guardianArticles,
        ...nytArticles,
      ];

      // Update state and save articles to localStorage
      setArticles(aggregatedArticles);
      localStorage.setItem("articles", JSON.stringify(aggregatedArticles));
    } catch (fetchError) {
      console.error("Error fetching articles:", fetchError);
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, loading, error, fetchArticles };
};

export default useFetchArticles;
