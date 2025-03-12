# GIRAI

[OpenUp](https://www.openup.org.za) developed generative AI chatbot for [Global Center on AI Governance](https://www.globalcenter.ai/).

## Architecture

This repo contains a NextJS React app in the root and a Vite React app in `/embed`. This is to aid building of the `/public/chat.js` file which can be embedded on websites.

## Development
```bash
yarn dev
```

Changes to `/embed` files are automatically rebuilt to produce `/public/chat.js`.
