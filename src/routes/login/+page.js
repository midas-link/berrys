import { redirect } from "@sveltejs/kit";
export const prerender = false;
export const ssr = false; // This makes it client-side only
export async function load({url ,data}) {
    if(data && data.user) {
        const user = data.user ;
        if(user.isAdmin) {
            throw redirect(302, `${url.base}/admin`);
        }
        else{
            throw redirect(302, `${url.base}/home`);
        }
    }
    return {};
}