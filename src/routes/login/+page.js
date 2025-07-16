import { redirect } from "@sveltejs/kit";

export async function load({url ,data}) {
    if(data && data.user) {
        const user = data.user ;
        if(user.isAdmin) {
            throw redirect(302, `/admin`);
        }
        else{
            throw redirect(302, `/home`);
        }
    }
    return {};
}