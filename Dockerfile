FROM node:lts as BUILDER
#ARG NPMTOKEN
WORKDIR /app
COPY package.json /app/package.json
COPY tsconfig.json /app/tsconfig.json
COPY tsconfig.node.json /app/tsconfig.node.json
COPY vite.config.ts /app/vite.config.ts
COPY public /app/public
COPY index.html /app/index.html
COPY manifest.json /app/public/manifest.json
COPY src /app/src
COPY server.cjs /app/server.cjs
#COPY .npmrc /app/.npmrc
RUN npm run prod
RUN rm -rf node_modules package-lock.json
RUN npm i --omit=dev
#RUN rm -rf .npmrc

FROM node:lts-slim
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
#COPY --from=builder /app/src/manifestJSONData.js /app/src/manifestJSONData.js
COPY server.cjs /app/server.cjs
CMD ["node", "./server.cjs"]
EXPOSE 5100