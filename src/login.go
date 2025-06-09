package main

import (
	"time"

	"golang.org/x/net/websocket"
)

// checkLogin checks the login credentials of a client and returns true if they
// are valid. It may do this by querying an external database or by using a
// simple username/password check.
func checkLogin(ws *websocket.Conn, clientId string) bool {
	time.Sleep(2 * time.Second)
	return false
}
