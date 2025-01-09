import { create } from "zustand";

export const useFavoritesStore = create((set) => ({
  starredAuthors: [],
  addAuthor: (author) => set((state) => ({
    starredAuthors: [...new Set([...state.starredAuthors, author])],
  })),
  removeAuthor: (author) => set((state) => ({
    starredAuthors: state.starredAuthors.filter((a) => a !== author),
  })),
  isStarred: (author) => (state) => state.starredAuthors.includes(author),
}));
