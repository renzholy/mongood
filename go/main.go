package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/andybalholm/brotli"
	"github.com/markbates/pkger"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	ctx     context.Context
	clients sync.Map
	mux     = http.NewServeMux()
)

func runCommand(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		Connection string
		Database   string
		Command    string
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
	client, err := create(request.Connection)
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
	compressor := brotli.HTTPCompressor(w, r)
	compressor.Write([]byte(raw.String()))
	compressor.Close()
}

func create(uri string) (*mongo.Client, error) {
	cached, ok := clients.Load(uri)
	if ok && cached != nil {
		return cached.(*mongo.Client), nil
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

func listConnections(w http.ResponseWriter, r *http.Request) {
	uris := os.Getenv("MONGO_URIS")
	var data []byte
	var err error
	if uris == "" {
		data = []byte("[]")
	} else {
		data, err = json.Marshal(strings.Split(uris, "|"))
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	compressor := brotli.HTTPCompressor(w, r)
	compressor.Write(data)
	compressor.Close()
}

func main() {
	ctx = context.Background()

	// serve root dir
	mux.Handle("/", http.FileServer(pkger.Dir("/dist")))

	// handle runCommand
	mux.HandleFunc("/api/runCommand", runCommand)

	// handle listConnections
	mux.HandleFunc("/api/listConnections", listConnections)

	// start service
	startService()

	defer destory()
}
