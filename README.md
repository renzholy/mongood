# Mongood

MongoDB Operation Dashboard

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b5f9ef66205961e4ddd/maintainability)](https://codeclimate.com/github/RenzHoly/Mongood/maintainability)

## 🔮 Features:

- [x] [mongo-shell data types](https://docs.mongodb.com/manual/core/shell-types/) query grammar
- [x] safely query & sort using [indexes](https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/)
- [x] built with [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui)
- [x] auto dark mode
- [ ] and so on...

## 🚧 Roadmap:

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
cd go
go build .
MONGO_URL="mongodb://localhost:27017" ./mongood
```

### Run as server:

```shell
docker run -p 3000:3000 -e MONGO_URL="mongodb://localhost:27017" renzholy/mongood
```

### Dev mode:

```shell
npm ci
npm run dev
cd go
go run main.go headless.go
```

## 📷 Screenshots:

![](/screenshots/docs.png)

![](/screenshots/editor.png)

![](/screenshots/indexes.png)

![](/screenshots/ops.png)
