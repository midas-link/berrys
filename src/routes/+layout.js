


import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { base } from '$app/paths';

export const prerender = false;
/** @type {import('./$types').LayoutLoad} */
export async function load({ url, data }) {
  // if (browser) {
  //   const storedPath = sessionStorage.getItem('spaPath');
  //   if (storedPath) {
  //     sessionStorage.removeItem('spaPath');
  //     const basePath = base;
  //     const cleanPath = storedPath.startsWith(basePath)
  //       ? storedPath.substring(basePath.length) || '/'
  //       : storedPath;
  //     if (url.pathname === basePath + '/' || url.pathname === '/') {
  //       // console.log(cleanPath);
  //       goto(cleanPath);
  //     }
  //   }
  // }
  return {
    user: data && data.user ? data.user : null
  };
}