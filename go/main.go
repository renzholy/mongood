package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gobuffalo/packr"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	ctx     context.Context
	clients = sync.Map{}
)

func runCommand(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		URI      string
		Database string
		Command  string
	}
	request := Request{}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Println(request.Database, request.Command)
	var command interface{}
	err = bson.UnmarshalExtJSON([]byte(request.Command), true, &command)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	client, err := create(request.URI)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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

func create(uri string) (*mongo.Client, error) {
	cached, ok := clients.Load(uri)
	if ok && cached != nil {
		return cached.(*mongo.Client), nil
	}
	if uri == "" {
		if os.Getenv("MONGO_URL") != "" {
			uri = os.Getenv("MONGO_URL")
		} else {
			uri = "mongodb://localhost:27017"
		}
	}
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	err = client.Connect(ctx)
	if err != nil {
		return nil, err
	}
	clients.Store(uri, client)
	return client, nil
}

func destory() {
	clients.Range(func(k, v interface{}) bool {
		v.(*mongo.Client).Disconnect(ctx)
		return true
	})
}

func main() {
	ctx = context.Background()

	// serve root dir
	root := os.Getenv("ROOT")
	if root == "" {
		root = "../dist"
	}
	http.Handle("/", http.FileServer(packr.NewBox(root)))

	// handle runCommand
	http.HandleFunc("/api/runCommand", runCommand)

	// start service
	startService()

	defer destory()
}
