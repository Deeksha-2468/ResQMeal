# ResQMeal

Live Demo: https://resqmeal-coral.vercel.app/


ResQMeal is a food-rescue coordination platform connecting restaurants, NGOs/community kitchens and volunteers so that surplus food is collected and delivered where it is needed.

## Run locally

```bash
npm install
npm run dev       # opens at http://localhost:5173
npm run build
npm run preview
```

## Routes

- `/` — home, choose a role
- `/restaurant` — restaurant dashboard
- `/ngo` — NGO / community kitchen dashboard
- `/volunteer` — volunteer dashboard

## Status

Milestone 1 is the application foundation with placeholder dashboards. Supabase (auth, database, RLS) will be connected in a later milestone; no backend is implemented yet.
