FROM node:slim AS node-builder
WORKDIR /src/node
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY vite.config.ts .
COPY tsconfig.json .
COPY public ./public
COPY src ./src
RUN yarn build

FROM golang:alpine AS golang-builder
RUN go env -w GO111MODULE=on
WORKDIR /src/golang
COPY go/go.mod go/go.sum ./
RUN go mod download
COPY go/. .
COPY --from=node-builder /src/node/dist ./dist
RUN go build -tags headless -o mongood .

FROM alpine
ENV PORT=3000
EXPOSE 3000
COPY --from=golang-builder /src/golang/mongood /usr/local/bin/mongood
CMD ["/usr/local/bin/mongood"]
