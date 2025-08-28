# Discussion

- Updated NextJS to the latest version. Noticed this is the version that has the middleware vulnerability. (https://github.com/stoplion/solace-advocates/pull/1)
- Resolve hydration errors issues in frontend / backend. Get all the code pushed to repo (https://github.com/stoplion/solace-advocates/pull/2)
- Split the search into individual words (["john", "doe"]) to make the search better (https://github.com/stoplion/solace-advocates/pull/3)
  ![](./DISCUSSION_IMAGES/image.png)
- Get some super basic styles (no colors atm, just structural / UX improvements) to make presentation a tad better. Nothing fancy, just reorganizing the presentation slightly.
  ![](DISCUSSION_IMAGES/image2.png)
- A little more polish to frontend and some small performance tweaks via debouncing, async error handling, and logs removed
- Switched up search from table scan + frontend filtering to backend search, added some pagination, and added some indexes and tidy'd up the frontend a little more add a splash every so slight color (Solace color √).
- Noticed `/src/app/api/seed/route.ts` isn’t protected, but since this is just a demo app, adding auth to the API might not be necessary right now. Skipping.
