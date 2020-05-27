// +build !headless

package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/phayes/freeport"
	"github.com/wailsapp/wails/lib/renderer/webview"
)

func startService() {
	intPort, err := freeport.GetFreePort()
	if err != nil {
		log.Fatal(err)
		return
	}
	port := strconv.Itoa(intPort)

	go http.ListenAndServe(":"+port, nil)
	w := webview.NewWebview(webview.Settings{
		Title:     "Mongood",
		URL:       "http://localhost:" + port,
		Width:     1280,
		Height:    800,
		Resizable: true,
	})
	w.Run()
	defer w.Terminate()
}
