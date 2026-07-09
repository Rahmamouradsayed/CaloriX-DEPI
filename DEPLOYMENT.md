# CaloriX Free Deployment Guide

Recommended free setup:

- Frontend: GitHub Pages
- Backend: Render free Web Service
- Database: Neon free Postgres
- Chatbot: Groq API key on the backend

## 1) Deploy the backend

1. Create a free Neon Postgres database and copy its pooled connection string.
2. In Render, create a new Web Service from this GitHub repository.
3. Use:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render:
   - `DATABASE_URL` = your Neon connection string
   - `GROQ_API_KEY` = your Groq API key
   - `JWT_SECRET_KEY` = a long random secret
   - `ENABLE_LOCAL_MODEL` = `0`
5. Deploy and open the backend URL. You should see: `CaloriX API is running`.

## 2) Connect the frontend

Edit `src/utils/config.js` and replace:

```js
https://YOUR-BACKEND-URL.onrender.com
```

with your real backend URL, for example:

```js
https://calorix-api.onrender.com
```

Then commit and push.

## 3) Deploy the frontend with GitHub Pages

1. Open the repository on GitHub.
2. Go to Settings → Pages.
3. Source: Deploy from a branch.
4. Branch: `main`, folder: `/root`.
5. Save.

Your frontend will be available at:

```text
https://<your-github-username>.github.io/CaloriX/
```

## Notes

- Do not deploy the local Llama model on a free web service. Use Groq/Gemini/OpenAI/Anthropic through backend environment variables.
- If the backend sleeps on the free tier, the first chatbot message may take around a minute after inactivity.
- Never put API keys in frontend JavaScript.
