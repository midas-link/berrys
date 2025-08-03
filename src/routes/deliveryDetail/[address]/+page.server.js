import {error} from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({fetch,params}) {
    const addressFromURL = params.address;

    try {
        const response = await fetch(`/api/Delivery_Details/${addressFromURL}`, {
            headers: {
                'Content-Type': 'application/json' 
            },
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            if(!data || !data.location) {
                throw error(500, 'Unexpected data format from backend for address ' + addressFromURL);
            }
            if(data.length === 0) {
                throw error(404, `No delivery details found for address '${addressFromURL}'.`);
            }
            return {
                siteCode: addressFromURL,
                locationData: data.location,
                deliveryEvents: data.events
            };
        } else {
            const errorData = await response.json().catch(() => ({}));
            if(response.status === 404) {
                throw error(404, errorData.error || `No delivery details found.`);
            }
            else if (response.status === 401 || response.status === 403) {
                throw error(response.status, errorData.error || 'Authentication required or access forbidden.');
            }
            else {
                throw error(response.status, errorData.error || 'Failed to load delivery details due to a server error.');
            }
        }
    } catch(err) {
        console.error(`Error in load function for address ${addressFromURL}:`, err);
        throw error(500, 'An unexpected error occurred while loading delivery details.');
    }
}