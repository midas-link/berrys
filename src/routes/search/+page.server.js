// src/routes/search/+page.server.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, fetch }) {
  const searchTerm = url.searchParams.get('q');
  let searchResults = [];
  let searchError = null;

  if (searchTerm) {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);

      if (response.ok) {
        searchResults = await response.json();
      } else {
        const errorData = await response.json();
        searchError = errorData;
        searchResults = [];
        console.error("API error:", errorData);
      }
    } catch (err) {
      searchError = 'A network error occurred.';
      searchResults = [];
      throw error(500, { message: 'Failed to fetch search results.' });
    }
  }

  return {
    searchResults,
    searchTerm,
    searchError
  };
}