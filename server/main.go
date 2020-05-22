package main

import (
	"context"
	"os"

	"github.com/gofiber/compression"
	"github.com/gofiber/cors"
	"github.com/gofiber/fiber"
	"github.com/gofiber/logger"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	ctx      context.Context
	database *mongo.Database
)

func main() {
	url := os.Getenv("MONGO_URL")
	if url == "" {
		url = "mongodb://localhost:27017"
	}
	root := os.Getenv("ROOT")
	if root == "" {
		root = "../dist"
	}
	client, _ := mongo.NewClient(options.Client().ApplyURI(url))
	database = client.Database("push")
	ctx = context.Background()
	client.Connect(ctx)
	defer client.Disconnect(ctx)
	app := fiber.New()
	app.Use(compression.New())
	app.Use(logger.New())
	app.Use(cors.New())
	app.Static("/", root)
	app.Post("/api/runCommand", func(c *fiber.Ctx) {
		type Request struct {
			Database string
			Command  string
		}
		var request Request
		c.BodyParser(&request)
		var command interface{}
		parseErr := bson.UnmarshalExtJSON([]byte(request.Command), true, &command)
		if parseErr != nil {
			c.Status(400).Send(parseErr)
			return
		}
		result, err := client.Database(request.Database).RunCommand(ctx, command).DecodeBytes()
		if err != nil {
			c.Status(500).Send(err)
			return
		}
		c.Fasthttp.SetContentType("application/json")
		c.Send(result)
	})
	app.Post("/api/listDatabases", func(c *fiber.Ctx) {
		type Request struct {
			Filter string
		}
		var request Request
		c.BodyParser(&request)
		var filter interface{}
		parseErr := bson.UnmarshalExtJSON([]byte(request.Filter), true, &filter)
		if parseErr != nil {
			c.Status(400).Send(parseErr)
			return
		}
		result, err := client.ListDatabases(ctx, filter)
		if err != nil {
			c.Status(500).Send(err)
			return
		}
		c.JSON(result)
	})
	app.Listen(3000)
}
