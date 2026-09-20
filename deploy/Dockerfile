FROM node:24-bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive \
    FFMPEG_BIN=/usr/bin/ffmpeg \
    ATLAS_PYTHON=/usr/bin/python3 \
    ATLAS_BROWSER_EXECUTABLE=/usr/bin/chromium \
    ATLAS_RENDER_CONCURRENCY=2 \
    PYTHONPATH=/app/renderer/.python \
    HF_HUB_DISABLE_TELEMETRY=1
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium ffmpeg python3 python3-pip ca-certificates fonts-liberation fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY renderer/package.json renderer/package-lock.json ./renderer/
RUN cd renderer && npm ci && npm cache clean --force
RUN python3 -m pip install --no-cache-dir --target /app/renderer/.python faster-whisper==1.2.1
COPY . .
RUN mkdir -p data Musicas .temp renderer/public/auto renderer/public/audio renderer/src/generated renderer/.models \
    && chown -R node:node /app
USER node
CMD ["node", "server.mjs"]
