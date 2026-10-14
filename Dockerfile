FROM node:22-alpine
RUN apk add --no-cache tzdata
WORKDIR /app
COPY server.js ./
COPY public ./public
ENV TZ=Europe/Minsk NODE_ENV=production DATA_DIR=/data PORT=3000
RUN mkdir -p /data && chown node:node /data
VOLUME /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/healthz || exit 1
CMD ["node", "server.js"]
