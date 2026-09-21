FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache git bash curl \
    && corepack enable

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN pnpm install --ignore-scripts

COPY . .

EXPOSE 3000

CMD ["sh"]