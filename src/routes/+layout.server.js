import { redirect } from "@sveltejs/kit";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { base } from "$app/paths";

export async function load(event) {
    console.log('--- LAYOUT LOAD DEBUG START ---');
    console.log('Current Pathname:', event.url.pathname);
    const basePath = base; 
    console.log('Base Path:', basePath);
    
    const publicRootPaths = [
        `${basePath}/login`,
        `${basePath}/login/accounts/password/forgot`,
        `${basePath}/login/reset-password`,
        `${basePath}/register`,
        `${basePath}/register/`,
        `${basePath}/`,
        `${basePath}` 
    ];
    
    const currentPathname = event.url.pathname;
    const isLoginPage = currentPathname === `${basePath}/login` || currentPathname === `${basePath}/login/`;
    const isRegisterPage = currentPathname === `${basePath}/register` || currentPathname === `${basePath}/register/`;
    const isPublicPage = publicRootPaths.includes(currentPathname);
    
    let user = null;    
    const token = event.cookies.get('loggedInCookie');
    
    if (!token) {
        if (isPublicPage) {
            console.log('No token, but on a public page. No redirect.');
            return { user: null };
        } else {
            console.log('No token and not on a public page, redirecting to login.');
            throw redirect(302, `${basePath}/login/?authMessage=Please%20log%20in%20to%20access%20this%20page.`);
        }
    }
    
    try{
        const decoded = await new Promise((resolve,reject) => {
            jwt.verify(token,JWT_SECRET, (error,userPayload)=> { 
                if(error){
                    reject(error);
                } else  {
                    resolve(userPayload);
                }
            });
        });
        user = decoded;
    } catch(err) {
        console.error("JWT verification error:", err);
    }
    
    const isAdminPage = currentPathname.startsWith(`${basePath}/admin`);
  
    if (user && (isLoginPage || isRegisterPage)) { 
        const redirectTo = user.isAdmin > 0 ? `${basePath}/admin/` : `${basePath}/home/`;
        throw redirect(302, redirectTo);
    }
    
    if (!user && !isPublicPage) { 
        throw redirect(302, `${basePath}/login/?authMessage=Please%20log%20in%20to%20access%20this%20page.`);
    }
    
    return {
        user: user ? { userId: user.userId,companyName: user.companyName, email: user.email, isAdmin: user.isAdmin, firstName: user.firstName, lastName: user.lastName, companyImage: user.companyImage , phoneNumber: user.phoneNumber , title:user.title, businessUnit : user.businessUnit, emailAlert: user.emailAlert, webAlert:user.webAlert } : null
    };
}