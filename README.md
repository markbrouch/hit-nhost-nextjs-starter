## Nhost & Next.js example (WIP)

This demo is a work in progress, further improvements are to come

Forked from https://github.com/nhost/nhost for use with mookuauhau-nhost-backend

## Get started

1. Clone the repository

```sh
git clone https://github.com/hawaiiansintech/nhost-nextjs-starter
cd nhost-nextjs-starter
```

2. Install dependencies

```sh
pnpm install
```

3. Terminal 2: Start React App

```sh
pnpm run dev
```

If you want to use this demo with the nhost.io cloud instance:

- `cp .env.example .env.local`
- update the NEXT_PUBLIC_NHOST_BACKEND_URL

- don't forget to change the client URL in the Nhost console so email verification will work: `Users -> Login Settings -> Client login URLs`: `http://localhost:4000`

If you want to use a local Nhost instance, start the CLI in parallel to Nextjs:
