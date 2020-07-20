FROM node:12.18.2-alpine3.11

COPY packages/tetris-server/dist packages/tetris-server/dist

COPY packages/tetris-server/node_modules packages/tetris-server/node_modules

COPY packages/tetris/build packages/tetris/build

COPY lerna.json ./

EXPOSE 8080

CMD ["node", "packages/tetris-server/dist/app.js"]