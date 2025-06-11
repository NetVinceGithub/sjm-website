# Use official Node.js slim image
FROM node:18-slim

# Puppeteer dependencies
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-6 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  xdg-utils \
  wget \
  --no-install-recommends \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Skip Puppeteer's Chromium download only if you bundle Chromium manually
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
