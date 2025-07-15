


import { goto } from '$app/navigation';
import { browser } from '$app/environment';
export const prerender = false;
/** @type {import('./$types').LayoutLoad} */
export async function load({url, data }) {
  const dataFromParent = data; 
  if (browser) {
    const storedPath = sessionStorage.getItem('spaPath');
    if (storedPath) {
      sessionStorage.removeItem('spaPath');
      const basePath = url.base;
      const cleanPath = storedPath.startsWith(basePath) 
        ? storedPath.substring(basePath.length) || '/'
        : storedPath;
      if (url.pathname === basePath + '/' || url.pathname === '/') {
        console.log(cleanPath);
        goto(cleanPath);
      }
    }
  }
  return {
    user: dataFromParent && dataFromParent.user ? dataFromParent.user : null
  };
}