# 🚀 Deploy Guide - GitHub Pages

This guide will help you deploy **Solution Hub** to GitHub Pages so you can share your portfolio online.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your customized Solution Hub ready to deploy

## Step-by-Step Deployment

### 1. Create a New Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository settings:
   - **Name**: `documentacao_solucoes` (or any name you prefer)
   - **Description**: "My Power Platform Portfolio - Flows, Apps, Pipelines & Dashboards"
   - **Visibility**: Public (required for free GitHub Pages)
   - **Don't** initialize with README (we already have one)
4. Click **"Create repository"**

### 2. Initialize Local Repository

Open your terminal/command prompt in the project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Solution Hub portfolio"

# Add remote repository (replace arturlima25 with your GitHub username)
git remote add origin https://github.com/arturlima25/documentacao_solucoes.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **"Save"**

### 4. Wait for Deployment

- GitHub will build and deploy your site (usually takes 1-2 minutes)
- A green box will appear with your site URL: `https://arturlima25.github.io/documentacao_solucoes/`
- Click the link to view your portfolio!

## Custom Domain (Optional)

Want to use your own domain like `portfolio.yourdomain.com`?

1. In GitHub Pages settings, add your custom domain
2. In your domain provider's DNS settings, add:
   - **Type**: CNAME
   - **Name**: `portfolio` (or `www`)
   - **Value**: `arturlima25.github.io`
3. Create a file named `CNAME` in your repository root with your domain:
   ```
   portfolio.yourdomain.com
   ```

## Updating Your Portfolio

Whenever you make changes:

```bash
# Add changes
git add .

# Commit with a message
git commit -m "Update portfolio data"

# Push to GitHub
git push
```

GitHub Pages will automatically rebuild and deploy your changes!

## Troubleshooting

### Site not loading?
- Wait 5 minutes after enabling GitHub Pages
- Check that you selected the correct branch (`main`)
- Ensure your repository is public
- Clear your browser cache

### Changes not appearing?
- GitHub Pages can take 1-5 minutes to rebuild
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check the Actions tab to see build status

### 404 errors?
- Make sure `index.html` is in the root folder
- Check that file names match exactly (case-sensitive)

## Security Notes

⚠️ **Important**: Your repository is public, so:
- Don't include sensitive information (passwords, API keys, etc.)
- The sample data is already generic and safe to share
- Double-check `flows-data.json` before pushing

## Need Help?

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)
- [Open an Issue](https://github.com/your-username/documentacao_solucoes/issues)

---

**🎉 Congratulations! Your portfolio is now live and ready to share on LinkedIn!**
