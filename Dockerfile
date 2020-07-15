FROM node:slim AS node-builder
WORKDIR /src/node
ADD package.json .
ADD package-lock.json .
RUN npm ci
ADD .umirc.ts .
ADD tsconfig.json .
ADD public ./public
ADD src ./src
RUN npm run build

FROM golang:alpine AS golang-builder
RUN go env -w GO111MODULE=on
RUN go env -w GOPROXY=https://goproxy.io,direct
RUN go get github.com/markbates/pkger/cmd/pkger
WORKDIR /src/golang
COPY go/go.mod go/go.sum ./
RUN go mod download
COPY go/. .
COPY --from=node-builder /src/node/dist ./dist
RUN /go/bin/pkger
RUN go build -tags headless -o mongood .

FROM alpine
ENV PORT=3000
EXPOSE 3000
COPY --from=golang-builder /src/golang/mongood /usr/local/bin/mongood
CMD ["/usr/local/bin/mongood"]
