# Security Guidelines - HRIA App

## API Key Management

### ⚠️ CRITICAL: Never Commit API Keys to Git

This project uses Google Gemini API which requires an API key. **API keys must NEVER be committed to version control.**

### Setup Instructions

1. **Create a `.env` file** in the project root (this file is gitignored):
   ```bash
   cp .env.example .env
   ```

2. **Add your API key** to the `.env` file:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Get your API key** from:
   - [Google AI Studio](https://makersuite.google.com/app/apikey)
   - [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### API Key Best Practices

#### ✅ DO:
- Store API keys in `.env` file (gitignored)
- Use environment variables (`import.meta.env.VITE_GEMINI_API_KEY`)
- Set API restrictions in Google Cloud Console:
  - **Application restrictions**: HTTP referrers for web apps
  - **API restrictions**: Limit to only Gemini API
- Rotate API keys regularly
- Delete unused API keys

#### ❌ DON'T:
- Hardcode API keys in source code
- Commit `.env` file to Git
- Share API keys in chat, email, or documentation
- Use the same API key across multiple projects
- Leave API keys unrestricted

### What to Do If API Key Is Exposed

If you accidentally commit an API key to Git:

1. **Immediately revoke the key** in Google Cloud Console
2. **Create a new key** with proper restrictions
3. **Clean Git history** (see below)
4. **Update `.env`** with the new key

### Cleaning Git History

If an API key was committed to Git, you must remove it from history:

#### Option 1: Using git filter-branch
```bash
# Backup first
git branch backup-before-cleanup

# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: rewrites history)
git push origin --force --all
```

#### Option 2: Using BFG Repo-Cleaner (Recommended)
```bash
# Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/

# Create a file with the exposed key
echo "your_exposed_api_key" > passwords.txt

# Run BFG
java -jar bfg.jar --replace-text passwords.txt .

# Clean up and push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

⚠️ **Warning**: Force pushing rewrites Git history. Notify all collaborators to re-clone the repository.

## Environment Variables

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI analysis | Yes |

### Adding New Environment Variables

1. Add to `.env.example` with placeholder value
2. Add to `.env` with actual value
3. Document in this file
4. Update application code to use `import.meta.env.VITE_*`

**Note**: Vite only exposes variables prefixed with `VITE_` to the client.

## Security Checklist

Before committing code:
- [ ] No API keys in source code
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has placeholder values only
- [ ] All secrets use environment variables
- [ ] API keys have restrictions enabled

## Reporting Security Issues

If you discover a security vulnerability, please email the project maintainer instead of creating a public issue.
