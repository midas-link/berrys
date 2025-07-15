// src/routes/+layout.js

import { goto } from '$app/navigation';
import { browser } from '$app/environment';

export const prerender = false;

export async function load({ url, data }) {
    if (browser) {
        const storedPath = sessionStorage.getItem('spaPath');
        if (storedPath) {
            sessionStorage.removeItem('spaPath');
            const basePath = url.base;
            const cleanPath = storedPath.startsWith(basePath)
                ? storedPath.substring(basePath.length) || '/'
                : storedPath;
            if (url.pathname === basePath + '/' || url.pathname === '/') {
                goto(cleanPath);
            }
        }
    }

    return {
        user: data && data.user ? data.user : null
    };
}
