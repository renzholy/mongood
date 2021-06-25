# Mongood

<img src="./go/assets/logo.png" width="100" height="100" align="right" />

一个遵循 [Fluent Design](https://www.microsoft.com/design/fluent/) 的 [MongoDB](https://www.mongodb.com/) GUI

[![License: AGPL 3.0](https://img.shields.io/badge/License-AGPL%203.0-brightgreen.svg)](https://opensource.org/licenses/AGPL-3.0)
[![docker](https://github.com/renzholy/mongood/actions/workflows/docker.yml/badge.svg)](https://github.com/renzholy/mongood/actions/workflows/docker.yml)
![GitHub Actions](https://github.com/renzholy/mongood/workflows/Release/badge.svg?branch=v0.1.0)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f7b2974cfea2417a8bd489a9bdbea4a7)](https://app.codacy.com/manual/renzholy/mongood?utm_source=github.com&utm_medium=referral&utm_content=renzholy/mongood&utm_campaign=Badge_Grade_Dashboard)
[![Maintainability](https://api.codeclimate.com/v1/badges/fabee053f887ed00344e/maintainability)](https://codeclimate.com/github/renzholy/mongood/maintainability)

[English](./README.md) | 简体中文

## 下载 ⚡️

- [客户端](https://github.com/renzholy/mongood/releases)
- [服务端](https://github.com/users/renzholy/packages/container/package/mongood)

## 特性 🔮

- [x] 既可以运行在服务端，也可以打包作为客户端使用（没有使用 Electron，但需要安装 Chrome）
- [x] 使用 [Monaco Editor](https://microsoft.github.io/monaco-editor/index.html) 作为编辑器，支持代码补全
- [x] 使用 [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui) 框架
- [x] 与 [Mongo Shell](https://docs.mongodb.com/manual/core/shell-types/) 一致的数据表达格式，如 `ObjectId()` `ISODate()` `Timestamp()`
- [x] 支持强制使用索引查询，避免拖慢数据库
- [x] 强大的 Profiling 展示功能，轻松分析慢查询
- [x] 支持为地理位置索引展示地图预览
- [x] 支持 MongoDB 的 [JSON Schema Validator](https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/)，可以自动生成 schema
- [x] 独特的 Notebook 功能，向 [Jupyter](https://jupyter.org/) 致敬
- [x] 支持 HTTP/2
- [x] 支持**黑暗**模式

## 截图 📷

<table>
  <tr>
    <td align="center"><img src="./screenshot/stats.png" />数据库状态信息</td>
    <td align="center"><img src="./screenshot/index.png" />按索引进行查询和排序</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/geo.png" />地理位置地图预览</td>
    <td align="center"><img src="./screenshot/document.png" />以文档模式展示数据</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/editor.png" />使用 Monaco Editor 编辑</td>
    <td align="center"><img src="./screenshot/multi-select.png" />拖拽多选</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/export.png" />多选文档导出/删除</td>
    <td align="center"><img src="./screenshot/indexes.png" />管理索引</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/profiling.png" />分析查询的每个步骤</td>
    <td align="center"><img src="./screenshot/schema.png" />编辑 JSON Schema</td>
  </tr>
  <tr>
    <td align="center"><img src="./screenshot/notebook.png" />Notebook (Beta)</td>
    <td align="center"><img src="./screenshot/dark.png" />黑暗模式</td>
  </tr>
</table>

## 开发 👨‍💻

### 前端

```bash
yarn
yarn dev
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
