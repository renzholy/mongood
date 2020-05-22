FROM golang:alpine AS golang-builder
RUN go env -w GO111MODULE=on
RUN go env -w GOPROXY=https://goproxy.io,direct
WORKDIR /src/golang
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/. .
RUN go build -o server .

FROM node:slim AS node-builder
WORKDIR /src/node
ADD package.json .
ADD package-lock.json .
RUN npm ci
ADD . .
RUN npm run build

FROM alpine
ENV TZ=Asia/Shanghai
ENV ROOT=/usr/local/bin/app/dist
EXPOSE 3000
COPY --from=golang-builder /src/golang/server /usr/local/bin/app/server
COPY --from=node-builder /src/node/dist /usr/local/bin/app/dist
CMD ["/usr/local/bin/app/server"]
