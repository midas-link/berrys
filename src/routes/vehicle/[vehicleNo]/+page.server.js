import { error } from '@sveltejs/kit';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params }) {
    const vehicleNumberFromURL = params.vehicleNo;

    try {
        const response = await fetch(`/api/Vehicle_Logs/${vehicleNumberFromURL}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' 
        });

        if (response.ok) {
            const data = await response.json();
            
            if (!Array.isArray(data)) { 
                throw error(500, `Unexpected data format from backend for vehicle '${vehicleNumberFromURL}'.`);
            }
            if (data.length === 0) {
                throw error(404, `Vehicle '${vehicleNumberFromURL}' not found.`);
            }

        
            return {
                vehicleEvents: data 
            };
        } else {
            const errorData = await response.json().catch(() => ({})); 

            if (response.status === 404) {
                throw error(404, errorData.error || `Vehicle '${vehicleNumberFromURL}' could not be found.`);
            }
            else if (response.status === 401 || response.status === 403) {
                throw error(response.status, errorData.error || 'Authentication required or access forbidden.');
            }
            else {
                throw error(response.status, errorData.error || 'Failed to load vehicle data due to a server error.');
            }
        }
    } catch (err) {
        console.error(`Error in load function for vehicle ${vehicleNumberFromURL}:`, err);
        throw error(500, 'An unexpected error occurred while loading vehicle data.');
    }
}