// nhost client

import { NhostClient } from '@nhost/nhost-js';

export const NHOST_BACKEND_URL = process.env.NHOST_BACKEND_URL as string;
// export const NHOST_SUBDOMAIN = process.env.NHOST_SUBDOMAIN as string;
// export const NHOST_REGION = process.env.NHOST_REGION as string;

export const config = {
    backendUrl: NHOST_BACKEND_URL,
    // subdomain: NHOST_SUBDOMAIN,
    // region: NHOST_REGION,
};

export const nhost = new NhostClient(config);

nhost.auth.onAuthStateChanged((event: any, session: any) => {
    console.log(`The auth state has changed. State is now ${event} with session: ${session}`);
    const jwt = session?.accessToken;

    if (event === 'SIGNED_IN') {

    }
    else {

    }
});

nhost.auth.onTokenChanged((session: any) => {
    console.log('auth.onTokenChanged() The access and refresh token has changed');
    console.log("session: ", session);
});

