import { create } from "zustand";

export const useFavoritesStore = create((set) => ({
  starredAuthors: [],
  preferences: [],

  addAuthor: (author) =>
    set((state) => ({
      starredAuthors: [...new Set([...state.starredAuthors, author])],
    })),
  
  removeAuthor: (author) =>
    set((state) => ({
      starredAuthors: state.starredAuthors.filter((a) => a !== author),
    })),
  
  addPreference: (newPreference) =>
    set((state) => {
      const isDuplicate = state.preferences.some(
        (pref) =>
          pref.source === newPreference.source &&
          JSON.stringify(pref.starredAuthors.sort()) ===
            JSON.stringify(newPreference.starredAuthors.sort()) &&
          pref.category === newPreference.category
      );
      if (isDuplicate) {
        console.warn("Duplicate preference detected. Preference not added.");
        return state; // Return state without changes
      }
      return {
        preferences: [...state.preferences, newPreference],
      };
    }),
  
  isStarred: (author) => (state) => state.starredAuthors.includes(author),
}));
