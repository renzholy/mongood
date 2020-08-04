# Mongood

一个遵循 [Fluent Design](https://www.microsoft.com/design/fluent/) 的 [MongoDB](https://www.mongodb.com/) GUI

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)
![GitHub Actions](https://github.com/renzholy/mongood/workflows/Release/badge.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/renzholy/mongood/badge)](https://www.codefactor.io/repository/github/renzholy/mongood)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b5f9ef66205961e4ddd/maintainability)](https://codeclimate.com/github/RenzHoly/Mongood/maintainability)

[English](./README.md) | 简体中文

## 特性 🔮

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

## 截图 📷

<table>
  <tr>
    <td align="center"><img src="./screenshot/stats.png" /> 数据库状态信息</td>
    <td align="center"><img src="./screenshot/index.png" /> 按索引进行查询和排序</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/geo.png" /> 地理位置地图预览</td>
    <td align="center"><img src="./screenshot/document.png" /> 以文档模式展示数据</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/editor.png" /> 使用 Monaco Editor 编辑</td>
    <td align="center"><img src="./screenshot/multi-select.png" /> 拖拽多选</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/export.png" /> 多选文档导出/删除</td>
    <td align="center"><img src="./screenshot/indexes.png" /> 管理索引</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/profiling.png" /> 分析查询的每个步骤</td>
    <td align="center"><img src="./screenshot/schema.png" /> 编辑 JSON Schema</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/notebook.png" /> Notebook (Beta)</td>
    <td align="center"><img src="./screenshot/dark.png" /> 黑暗模式</td>
  </tr>
</table>

## 安装 🔧

### 作为客户端使用

```bash
export PATH=$PATH:$(go env GOPATH)/bin
go get fyne.io/fyne/cmd/fyne
go get github.com/markbates/pkger/cmd/pkger
npm ci
npm run build
cd go
make mac-app
# 或者 `make windows-app`
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

## 开发计划 🚧

- [ ] 用户角色管理
- [ ] 性能监控
- [ ] 做成 VSCode 插件

欢迎提 PR 和 issue
