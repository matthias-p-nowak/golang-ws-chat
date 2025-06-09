package main

import (
	"encoding/json"
	"fmt"

	"net/http"
	"os"
	"strings"

	"github.com/matthias-p-nowak/golang-ws-chat/src/log"
	"golang.org/x/net/websocket"
	"gopkg.in/ini.v1"
)

var (
	// the root directory of the web content
	webroot string
)

// the default serving of files for the webchat
func fileServe(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[1:]
	if len(path) > 0 && (path[0] == '/' || path[0] == '.' || strings.Contains(path, "..")) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		log.Log("invalid path" + path)
		return
	}
	if path == "" {
		path = "index.html"
	}
	// the file to load and transfer
	file := "./" + webroot + "/" + path
	http.ServeFile(w, r, file)
	log.Log("served file " + file)
}

func syncHandler(ws *websocket.Conn) {
	defer ws.Close()
	log.Log("handling new websocket connection")
	var clientId string
	websocket.Message.Receive(ws, &clientId)
	log.Log("got clientId: " + clientId)
	for !checkLogin(ws, clientId) {
		resp := []string{"addInfo", "invalid login"}
		var b strings.Builder
		json.NewEncoder(&b).Encode(resp)
		websocket.Message.Send(ws, b.String())
	}
}

func handleWs(w http.ResponseWriter, r *http.Request) {
	wsHandler := websocket.Handler(syncHandler)
	log.Log("new ws connection")
	log.Log(fmt.Sprintf("connection from %s\n", r.RemoteAddr))
	wsHandler.ServeHTTP(w, r)
	log.Log("ws connection closed")
}

func main() {
	// fmt.Printf("current goroutines %d\n", runtime.NumGoroutine())
	log.Log("starting")
	if len(os.Args) < 2 {
		fmt.Println("Usage: go&chat <config file>")
		os.Exit(2)
	}
	cfg, err := ini.Load(os.Args[1])
	if err != nil {
		fmt.Printf("Failed to read file: %v\n", err)
		os.Exit(1)
	}
	webroot = cfg.Section("server").Key("webroot").String()
	serverAddress := cfg.Section("server").Key("address").String()
	http.HandleFunc("/", fileServe)
	http.HandleFunc("/ws", handleWs)
	http.ListenAndServe(serverAddress, nil)

}
