// +build headless

package main

import "net/http"

func startService(port string) {
	http.ListenAndServe(":"+port, nil)
}
