// +build headless

package main

import (
	"net/http"
	"os"
)

func startService() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	http.ListenAndServe(":"+port, nil)
}
