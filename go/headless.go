// +build headless

package main

import (
	"log"
	"net/http"
	"os"

	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

func startService() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	s := &http.Server{
		Addr:    ":" + port,
		Handler: h2c.NewHandler(mux, &http2.Server{}),
	}

	log.Println("listening: " + port)
	s.ListenAndServe()
}
