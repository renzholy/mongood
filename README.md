# Mongood

MongoDB Operation Dashboard

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b5f9ef66205961e4ddd/maintainability)](https://codeclimate.com/github/RenzHoly/Mongood/maintainability)

## 🔮 Features:

- [x] Server or client mode
- [x] Edit documents with [monaco editor](https://microsoft.github.io/monaco-editor/index.html)
- [x] [Mongo-shell data types](https://docs.mongodb.com/manual/core/shell-types/) query grammar
- [x] Smart query & sort using [indexes](https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/)
- [x] Json schema
- [x] Designed with [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui)
- [x] Auto **dark** mode

## 📷 Screenshots:

<div>
  <img src="./screenshot/light/docs.png" width="50%"/><img src="./screenshot/dark/docs.png" width="50%"/>
  <img src="./screenshot/light/editor.png" width="50%"/><img src="./screenshot/dark/editor.png" width="50%"/>
  <img src="./screenshot/light/indexes.png" width="50%"/><img src="./screenshot/dark/indexes.png" width="50%"/>
  <img src="./screenshot/light/ops.png" width="50%"/><img src="./screenshot/dark/ops.png" width="50%"/>
  <img src="./screenshot/light/schema.png" width="50%"/><img src="./screenshot/dark/schema.png" width="50%"/>
</div>

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
docker run -p 3000:3000 -e MONGO_URL="mongodb://host:port" renzholy/mongood
```

### Dev mode:

```shell
npm ci
npm run dev
cd go
go run main.go headless.go
```

## 🚧 Roadmap:

- [ ] geo search
- [ ] role management
- [ ] and so on...
