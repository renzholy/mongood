# Mongood

A [MongoDB](https://www.mongodb.com/) GUI with [Fluent Design](https://www.microsoft.com/design/fluent/)

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)
[![CodeFactor](https://www.codefactor.io/repository/github/renzholy/mongood/badge)](https://www.codefactor.io/repository/github/renzholy/mongood)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b5f9ef66205961e4ddd/maintainability)](https://codeclimate.com/github/RenzHoly/Mongood/maintainability)

English | [简体中文](./README-zh_CN.md)

## Feature 🔮

- [x] Server or client mode (without Electron)
- [x] Edit documents with [Monaco Editor](https://microsoft.github.io/monaco-editor/index.html)
- [x] Designed with [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui)
- [x] [Mongo Shell](https://docs.mongodb.com/manual/core/shell-types/) compatiable data type, eg: `ObjectId()` `ISODate()` `Timestamp()`
- [x] Find documents with index hint, avoiding slow operation
- [x] Fancy profiling exec stats
- [x] Geo preview for 2dsphere index
- [x] [JSON Schema Validator](https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/) supporting
- [x] Notebook function, just like [Jupyter](https://jupyter.org/)
- [x] HTTP/2
- [x] Auto **dark** mode

## Screenshot 📷

<table>
  <tr>
    <td align="center"><img src="./screenshot/stats.png"> Database status</td>
    <td align="center"><img src="./screenshot/index.png"> Find & sort with index</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/geo.png" /> Geo preview</td>
    <td align="center"><img src="./screenshot/document.png" /> Document mode</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/editor.png" /> Edit with Monaco Editor</td>
    <td align="center"><img src="./screenshot/multi-select.png" /> Dragable multi-selection</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/export.png" /> Documents export</td>
    <td align="center"><img src="./screenshot/indexes.png" /> Indexes managment</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/profiling.png" /> Analyse profiling</td>
    <td align="center"><img src="./screenshot/schema.png" /> Edit JSON Schema</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/notebook.png" /> Notebook (Alpha)</td>
    <td align="center"><img src="./screenshot/dark.png" /> Dark mode</td>
  </tr>
</table>

## Setup 🔧

### As client

```bash
go get fyne.io/fyne/cmd/fyne
go get github.com/markbates/pkger/cmd/pkger
npm ci
npm run build
cd go
make mac-app
# or `make windows-app`
```

### As server

```bash
docker run -p 3000:3000 -e MONGO_URIS="mongodb://localhost:27017|mongodb://user:password@example.com:27017" renzholy/mongood
# open in browser http://localhost:3000
```

## Development 👨‍💻

### Frontend

```bash
npm ci
npm run dev
```

### Backend

```bash
cd go
go run main.go headless.go
```

## Roadmap 🚧

- [ ] Role management
- [ ] Performance moniting
- [ ] VSCode plugin

Feel free to pull request or create a issue !
