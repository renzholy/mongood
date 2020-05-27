FROM golang:alpine AS golang-builder
RUN go env -w GO111MODULE=on
RUN go env -w GOPROXY=https://goproxy.io,direct
WORKDIR /src/golang
COPY go/go.mod go/go.sum ./
RUN go mod download
COPY go/. .
RUN go build -tags headless -o mongood .

FROM node:slim AS node-builder
WORKDIR /src/node
ADD package.json .
ADD package-lock.json .
RUN npm ci
ADD .umirc.ts .
ADD tsconfig.json .
ADD src ./src
RUN npm run build

FROM alpine
ENV TZ=Asia/Shanghai
ENV PORT=3000
ENV ROOT=/var/www
EXPOSE 3000
COPY --from=golang-builder /src/golang/mongood /usr/local/bin/mongood
COPY --from=node-builder /src/node/dist /var/www
CMD ["/usr/local/bin/mongood"]
