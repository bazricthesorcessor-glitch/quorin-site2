# Deployment Guide: QUORIN Platform (Free Tier Stack)

This guide details how to deploy the QUORIN platform on a free-tier cloud architecture using **GitHub**, **Neon PostgreSQL**, **Render** (for the Medusa backend), and **Vercel** (for the Vite frontend).

---

## Architecture Overview

```
             GitHub (Codebase)
                /          \
               v            v
           Vercel          Render
      (Vite Frontend)  (Medusa Backend)
             \             /
              v           v
             Neon PostgreSQL
```

---

## Step 1: Create the Database on Neon PostgreSQL (Free Tier)

1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Create a new project named `quorin-db`.
3. In the project dashboard, select the database connection string. Make sure to select **Pooled Connection** (which uses PgBouncer on port `5432` or transaction pooling) and copy the URL. It will look like this:
   ```
   postgresql://[user]:[password]@[host]/neondb?sslmode=require
   ```
   *(Note: The `?sslmode=require` query parameter is required for connecting from external servers securely).*

---

## Step 2: Deploy the Medusa Backend on Render (Free Tier)

We have configured a `render.yaml` Blueprint file at the root of the repository to automate this setup.

1. Go to [Render.com](https://render.com/) and sign up.
2. Click **New +** and select **Blueprint**.
3. Link your GitHub repository (`quorin-site2`).
4. Render will automatically parse `render.yaml` and prompt you to fill in the following parameters:
   * **Service Name**: `quorin-backend`
   * **Database URL**: Paste your **Neon connection string** here.
   * **AUTH_CORS / STORE_CORS / ADMIN_CORS**:
     * Initially, you can leave these as default (`http://localhost:3000,http://localhost:5173`).
     * Once your Vercel frontend is deployed (Step 3), you will update these values on Render to include your Vercel domain name (e.g. `https://quorin-site2.vercel.app`).
5. Click **Apply**. Render will:
   * Build the project.
   * Apply database migrations automatically using `npx medusa db:migrate`.
   * Start the Medusa backend on a free instance.
6. Once the deployment finishes, copy the Render Web Service URL (e.g., `https://quorin-backend.onrender.com`).

---

## Step 3: Deploy the Frontend on Vercel (Free Tier / Student Pro)

1. Go to [Vercel.com](https://vercel.com/) and log in.
2. Click **Add New** > **Project** and import your GitHub repository (`quorin-site2`).
3. Configure the following settings during import:
   * **Framework Preset**: Select **Vite** (Vercel will usually auto-detect this).
   * **Root Directory**: Select `app` (since the Vite frontend code resides in the `app/` subdirectory).
4. Add the following **Environment Variables**:
   * `VITE_MEDUSA_BACKEND_URL`: Paste the URL of your Render backend copied in Step 2 (e.g., `https://quorin-backend.onrender.com`).
   * `VITE_MEDUSA_PUBLISHABLE_KEY`: Set this to your storefront publishable key (e.g. `pk_d24dd21f67e355e5c0b962f86f8402379a26d67a85eab02334b201085f563b62` or you can generate/find your key in your database).
5. Click **Deploy**.
6. Once the build completes, copy your Vercel deployment URL (e.g. `https://quorin-site2.vercel.app`).

---

## Step 4: Finalize CORS Configuration

To allow the Vercel frontend to query your Medusa backend without CORS issues, you must link them:

1. In your **Render Dashboard**, go to your `quorin-backend` Web Service.
2. Select **Environment** on the left menu.
3. Update the values of `AUTH_CORS`, `STORE_CORS`, and `ADMIN_CORS` to include your Vercel deployment domain (comma-separated, no trailing slash). Example:
   ```env
   http://localhost:3000,http://localhost:5173,https://quorin-site2.vercel.app
   ```
4. Save the changes. Render will automatically redeploy the backend with the new configuration.

Your online shop is now live and fully operational on the web!
