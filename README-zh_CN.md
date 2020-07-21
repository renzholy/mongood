# Mongood

一个遵循 [Fluent Design](https://www.microsoft.com/design/fluent/) 的 [MongoDB](https://www.mongodb.com/) GUI

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b5f9ef66205961e4ddd/maintainability)](https://codeclimate.com/github/RenzHoly/Mongood/maintainability)

## 特性 🔮

- [x] 既可以运行在服务端，也可以打包作为客户端使用（没有使用 Electron）
- [x] 使用 [Monaco Editor](https://microsoft.github.io/monaco-editor/index.html) 作为编辑器
- [x] 使用 [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui) 框架
- [x] 与 [Mongo Shell](https://docs.mongodb.com/manual/core/shell-types/) 一致的数据表达格式，如 `ObjectId()` `ISODate()` `Timestamp()`
- [x] 支持强制使用索引查询，避免拖慢数据库
- [x] 强大的 Profiling 展示功能，轻松分析慢查询
- [x] 支持 MongoDB 的 [JSON Schema Validator](https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/)
- [x] 独特的 Notebook 功能，向 [Jupyter](https://jupyter.org/) 致敬
- [x] 支持 HTTP/2
- [x] 支持**黑暗**模式

## 安装 🔧

### 作为客户端使用

```bash
go get fyne.io/fyne/cmd/fyne
npm ci
npm run build
cd go
make
# 打开 mongood.app 或 mongood.exe
```

### 作为服务端使用

```bash
docker run -p 3000:3000 -e MONGO_URIS="mongodb://localhost:27017|mongodb://user:password@example.com:27017" renzholy/mongood
# 浏览器中打开 http://localhost:3000
```

## 开发 👨‍💻

### 前端

```bash
npm ci
npm run dev
```

### 后端

```bash
cd go
go run main.go headless.go
```

## 未来计划 🚧

- [ ] 用户角色管理
- [ ] 性能监控

欢迎提 PR 和 issue
