import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoritesStore = create(
  persist(
    (set) => ({
      preferences: [],

      /**
       * 
       * @param {*} newPreference - new preference added from the NewsAggregator cokponent 
       * @returns 
       */
      addPreference: (newPreference) =>
        set((state) => {
          const existingPreferenceIndex = state.preferences.findIndex(
            (pref) =>
              pref.source === newPreference.source &&
              pref.category === newPreference.category
          );

          if (existingPreferenceIndex !== -1) {
            // Merge the starred authors if a preference with the same source and category exists
            const updatedPreferences = [...state.preferences];
            const existingPreference = updatedPreferences[existingPreferenceIndex];
            updatedPreferences[existingPreferenceIndex] = {
              ...existingPreference,
              starredAuthors: [
                ...new Set([
                  ...existingPreference.starredAuthors,
                  ...(newPreference.starredAuthors || []),
                ]),
              ],
            };

            return { preferences: updatedPreferences };
          }

          // Add new preference if no duplicate exists
          return {
            preferences: [
              ...state.preferences,
              { ...newPreference, starredAuthors: [...(newPreference.starredAuthors || [])] },
            ],
          };
        }),

        /**
         * 
         * @param {*} author 
         * @param {*} source 
         * @param {*} category 
         * @returns 
         */
      removeAuthorFromPreference: (author, source, category) =>
        set((state) => {
          const updatedPreferences = state.preferences.map((pref) => {
            if (pref.source === source && pref.category === category) {
              return {
                ...pref,
                starredAuthors: pref.starredAuthors.filter((a) => a !== author),
              };
            }
            return pref;
          });

          return { preferences: updatedPreferences };
        }),

      isStarred: (author, source, category) => (state) => {
        const preference = state.preferences.find(
          (pref) => pref.source === source && pref.category === category
        );
        return preference?.starredAuthors.includes(author) || false;
      },
    }),
    {
      name: "favorites-store", // Key for localStorage
      partialize: (state) => ({ preferences: state.preferences }), // Persist only preferences
    }
  )
);
