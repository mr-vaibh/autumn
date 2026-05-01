FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat curl
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["npm", "run", "dev"]
