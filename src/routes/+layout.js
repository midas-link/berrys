


import { goto } from '$app/navigation';
import { browser } from '$app/environment';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  if (browser) {
    const storedPath = sessionStorage.getItem('spaPath');
    if (storedPath) {
      sessionStorage.removeItem('spaPath');
      const basePath = '/berrys';
      const cleanPath = storedPath.startsWith(basePath) 
        ? storedPath.substring(basePath.length) || '/'
        : storedPath;
      if (window.location.pathname === basePath + '/' || window.location.pathname === '/') {
        goto(cleanPath);
      }
    }
  }
  const userFromLayoutServer = data && data.user ? data.user : null;
  return {
    user: userFromLayoutServer
  };
}