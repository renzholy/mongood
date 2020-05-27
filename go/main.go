package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gobuffalo/packr"
	"github.com/phayes/freeport"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	ctx    context.Context
	client *mongo.Client
)

func runCommand(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		Database string
		Command  string
	}
	request := Request{}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var command interface{}
	err = bson.UnmarshalExtJSON([]byte(request.Command), true, &command)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	raw, err := client.Database(request.Database).RunCommand(ctx, command).DecodeBytes()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(raw.String()))
}

func main() {
	var err error

	// connect mongodb
	url := os.Getenv("MONGO_URL")
	if url == "" {
		url = "mongodb://localhost:27017"
	}
	client, err = mongo.NewClient(options.Client().ApplyURI(url))
	if err != nil {
		log.Fatal(err)
		return
	}
	ctx = context.Background()
	client.Connect(ctx)
	defer client.Disconnect(ctx)

	// serve root dir
	root := os.Getenv("ROOT")
	if root == "" {
		root = "../dist"
	}
	http.Handle("/", http.FileServer(packr.NewBox(root)))

	// handle runCommand
	http.HandleFunc("/api/runCommand", runCommand)

	// setup port
	port := os.Getenv("PORT")
	if port == "" {
		intPort, err := freeport.GetFreePort()
		if err != nil {
			log.Fatal(err)
			return
		}
		port = strconv.Itoa(intPort)
	}

	// start service
	startService(port)
}
