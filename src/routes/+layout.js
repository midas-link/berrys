


import { base } from '$app/paths';

export const prerender = true;
/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  return {
    user: data && data.user ? data.user : null
  };
}