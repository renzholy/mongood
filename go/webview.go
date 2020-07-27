// +build !headless

package main

import (
	"log"
	"net/http"
	"os"

	"github.com/shibukawa/configdir"
	"github.com/zserge/lorca"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

func startService() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "54034" // 27017 * 2
	}
	s := &http.Server{
		Addr:    ":" + port,
		Handler: h2c.NewHandler(mux, &http2.Server{}),
	}
	go s.ListenAndServe()
	config := configdir.New("Mongood", "Mongood")
	dir := config.QueryCacheFolder().Path
	log.Println(dir)
	ui, err := lorca.New("http://localhost:"+port, dir, 1280, 800)
	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()
	<-ui.Done()
}
