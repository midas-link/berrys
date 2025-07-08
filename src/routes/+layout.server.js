import { redirect } from "@sveltejs/kit";
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { base } from "$app/paths";
async function load(event) {
    const PUBLIC_ROUTES = ['/berrys/login', '/berrys/register', '/berrys/']; 
    if (PUBLIC_ROUTES.includes(event.url.pathname)) {
        return { user: null }; 
    }
    const token = event.cookies.get('loggedInCookie');
    if(!token) throw redirect(302,`${base}/login?authMessage=Please%20log%20in%20to%20access%20this%20page.`);
    try{
        const decoded = await new Promise((resolve,reject) => {
            jwt.verify(token,JWT_SECRET, (error,user)=> { 
                if(error){
                    reject(error);
                } else  {
                    resolve(user);
                }
                });
        });
        event.locals.user = decoded;
        return{
            user:{
                userId: decoded.userId,
                email:decoded.email,
                isAdmin: decoded.isAdmin
            }
        };
    } catch(err) {
        let message = 'An unexpected Authentication error happened';
        if(err.name === 'TokenExpiredError')
            message =  'Your session has expired. Please log in again.'
        else if(err.name === 'JsonWebTokenError')
            message = 'Your token is invalid. Please log in again.'
        throw redirect(302,`${base}/login?authMessage=${encodeURIComponent(message)})`)
    }
}