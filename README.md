# Mongood

MongoDB Operation Dashboard

[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)

## 🔮 Features:

- [x] [mongo-shell data types](https://docs.mongodb.com/manual/core/shell-types/) query grammar
- [x] safely query & sort using [indexes](https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/)
- [x] built with [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui)
- [ ] and so on...

## 🔧 Usage:

### Docker run:

```shell
docker run -p 3000:3000 renzholy/mongood
```

### Custom mongo url:

```shell
docker run -p 3000:3000 -e MONGO_URL="mongodb://localhost:27017" renzholy/mongood
```

### Run dev:

```shell
npm run dev & go run server.go
```

## 📷 Screenshots:

![](/screenshots/docs.png)

![](/screenshots/stats.png)

## 🔮 TODO:

- [ ] doc insert, update and delete
- [ ] index create and drop
- [ ] geo search
- [ ] json schema
- [ ] role management
