import { NEW_YORK_TIMES, NEWS_DATA_IO, THE_GUARDIAN } from "./constants"

export const returnAggregatedNewsData = (source, data) => {
    switch(source) {
        case NEWS_DATA_IO:
            return data.map((article)=> ({
                source: NEWS_DATA_IO,
                title: article.title,
                url: article.link,
                publishedAt: article.pubDate,
                category: article.category[0] || "General",
            }));
        case THE_GUARDIAN:
            return data.map((article) => ({
                source: THE_GUARDIAN,
                title: article.webTitle,
                url: article.webUrl,
                publishedAt: article.webPublicationDate,
                category: article.sectionName || "General",
            }));
        case NEW_YORK_TIMES:
            return data.map((article) => ({
                source: NEW_YORK_TIMES,
                title: article.title,
                url: article.url,
                publishedAt: article.publish_date,
                category: article.category || "General",
            }));
        default: 
            return []
            // need to add some default code later
    }
}
