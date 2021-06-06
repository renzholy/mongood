package main

import (
	"context"
	"embed"
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/NYTimes/gziphandler"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	ctx           context.Context
	clients       sync.Map
	creationMutex sync.Mutex
	mux           = http.NewServeMux()
	//go:embed dist/*
	dist embed.FS
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
	w.Write([]byte(raw.String()))
}

func create(uri string) (*mongo.Client, error) {
	if cached, ok := clients.Load(uri); ok && cached != nil {
		return cached.(*mongo.Client), nil
	}

	// Use mutex to make sure there is only one active mongodb client instance for one uri.
	// While with mutex, clients for different mongodb servers must be created one by one.
	creationMutex.Lock()
	defer creationMutex.Unlock()

	// check again, if it is already created, just return.
	if cached, ok := clients.Load(uri); ok && cached != nil {
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
	opts := os.Getenv("MONGO_URIS")
	if opts == "" {
		opts = "[]"
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(opts))
}

func getFileSystem() http.FileSystem {
	fsys, err := fs.Sub(dist, "dist")
	if err != nil {
		log.Fatal(err)
	}
	return http.FS(fsys)
}

func main() {
	ctx = context.Background()

	// serve root dir
	mux.Handle("/", gziphandler.GzipHandler(http.FileServer(getFileSystem())))

	// handle runCommand
	mux.Handle("/api/runCommand", gziphandler.GzipHandler(http.HandlerFunc(runCommand)))

	// handle listConnections
	mux.Handle("/api/listConnections", gziphandler.GzipHandler(http.HandlerFunc(listConnections)))

	// start service
	startService()

	defer destory()
}
