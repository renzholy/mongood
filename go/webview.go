// +build !headless

package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/phayes/freeport"
	"github.com/wailsapp/wails/lib/renderer/webview"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

func startService() {
	intPort, err := freeport.GetFreePort()
	if err != nil {
		log.Fatal(err)
		return
	}
	port := strconv.Itoa(intPort)
	s := &http.Server{
		Addr:    ":" + port,
		Handler: h2c.NewHandler(mux, &http2.Server{}),
	}
	go s.ListenAndServe()
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
