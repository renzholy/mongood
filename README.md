# Mongood

A [MongoDB](https://www.mongodb.com/) GUI with [Fluent Design](https://www.microsoft.com/design/fluent/)

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b5f9ef66205961e4ddd/maintainability)](https://codeclimate.com/github/RenzHoly/Mongood/maintainability)

English | [简体中文](./README-zh_CN.md)

## Feature 🔮

- [x] 既可以运行在服务端，也可以打包作为客户端使用（没有使用 Electron）
- [x] 使用 [Monaco Editor](https://microsoft.github.io/monaco-editor/index.html) 作为编辑器
- [x] 使用 [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui) 框架
- [x] 与 [Mongo Shell](https://docs.mongodb.com/manual/core/shell-types/) 一致的数据表达格式，如 `ObjectId()` `ISODate()` `Timestamp()`
- [x] 支持强制使用索引查询，避免拖慢数据库
- [x] 强大的 Profiling 展示功能，轻松分析慢查询
- [x] 支持为地理位置索引展示地图预览
- [x] 支持 MongoDB 的 [JSON Schema Validator](https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/)
- [x] 独特的 Notebook 功能，向 [Jupyter](https://jupyter.org/) 致敬
- [x] 支持 HTTP/2
- [x] 支持**黑暗**模式

## 📷 Screenshot

<div>
  <img src="./screenshot/stats.png" width="70%" style="vertical-align: middle"/> Database status
  <img src="./screenshot/index.png" width="70%" style="vertical-align: middle"/> Find & sort with index
  <img src="./screenshot/geo.png" width="70%" style="vertical-align: middle"/> Geo preview
  <img src="./screenshot/document.png" width="70%" style="vertical-align: middle"/> Document mode
  <img src="./screenshot/editor.png" width="70%" style="vertical-align: middle"/> Edit with Monaco Editor
  <img src="./screenshot/multi-select.png" width="70%" style="vertical-align: middle"/> Dragable multi-selection
  <img src="./screenshot/export.png" width="70%" style="vertical-align: middle"/> Documents export
  <img src="./screenshot/indexes.png" width="70%" style="vertical-align: middle"/> Indexes managment
  <img src="./screenshot/profiling.png" width="70%" style="vertical-align: middle"/> Analyse profiling
  <img src="./screenshot/schema.png" width="70%" style="vertical-align: middle"/> Edit JSON Schema
  <img src="./screenshot/notebook.png" width="70%" style="vertical-align: middle"/> Notebook (Alpha)
  <img src="./screenshot/dark.png" width="70%" style="vertical-align: middle"/> Dark mode
</div>

## Setup 🔧

### As client

```bash
go get fyne.io/fyne/cmd/fyne
npm ci
npm run build
cd go
make
# open mongood.app or mongood.exe
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

Feel free to create a pull request or issue !
