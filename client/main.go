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
	"github.com/wailsapp/wails/lib/renderer/webview"
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
	port, err := freeport.GetFreePort()
	if err != nil {
		log.Fatal(err)
		return
	}
	url := os.Getenv("MONGO_URL")
	if url == "" {
		url = "mongodb://localhost:27017"
	}
	root := os.Getenv("ROOT")
	if root == "" {
		root = "../dist"
	}
	client, err = mongo.NewClient(options.Client().ApplyURI(url))
	if err != nil {
		log.Fatal(err)
		return
	}
	ctx = context.Background()
	client.Connect(ctx)
	defer client.Disconnect(ctx)
	folder := packr.NewBox(root)
	http.Handle("/", http.FileServer(folder))
	http.HandleFunc("/api/runCommand", runCommand)
	go http.ListenAndServe(":"+strconv.Itoa(port), nil)
	w := webview.NewWebview(webview.Settings{
		Title:     "Mongood",
		URL:       "http://localhost:" + strconv.Itoa(port),
		Width:     1280,
		Height:    800,
		Resizable: true,
	})
	w.Run()
	defer w.Terminate()
}
