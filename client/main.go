package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"

	"github.com/gobuffalo/packr"
	"github.com/wailsapp/wails/lib/renderer/webview"
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
	folder := packr.NewBox(root)
	http.Handle("/", http.FileServer(folder))
	http.HandleFunc("/api/runCommand", func(w http.ResponseWriter, r *http.Request) {
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
		var str map[string]interface{}
		bson.Unmarshal(raw, &str)
		json, err := json.Marshal(str)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/bson")
		w.Write(json)
	})
	go http.ListenAndServe(":3000", nil)
	w := webview.NewWebview(webview.Settings{
		Title:     "Mongood",
		URL:       "http://localhost:3000",
		Width:     1280,
		Height:    800,
		Resizable: true,
	})
	w.Run()
	defer w.Terminate()
}
