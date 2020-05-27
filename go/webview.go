// +build !headless

package main

import (
	"net/http"

	"github.com/wailsapp/wails/lib/renderer/webview"
)

func startService(port string) {
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
