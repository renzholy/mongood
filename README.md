# Mongood

MongoDB Operation Dashboard

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)

## 🔮 Features:

- [x] [mongo-shell data types](https://docs.mongodb.com/manual/core/shell-types/) query grammar
- [x] safely query & sort using [indexes](https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/)
- [x] built with [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui)
- [ ] and so on...

## 🚧 Roadmap:

- [ ] dark mode
- [ ] doc insert, update and delete
- [ ] index create and drop
- [ ] geo search
- [ ] json schema
- [ ] role management
- [ ] and so on...

## 🔧 Usage:

### Run as client:

```shell
npm ci
npm run build
cd client
MONGO_URL="mongodb://localhost:27017" go run main.go
```

### Run as server:

```shell
docker run -p 3000:3000 -e MONGO_URL="mongodb://localhost:27017" renzholy/mongood
```

### Dev mode:

```shell
npm ci
npm run dev
cd server
go run main.go
```

## 📷 Screenshots:

![](/screenshots/docs.png)

![](/screenshots/indexes.png)

![](/screenshots/ops.png)
