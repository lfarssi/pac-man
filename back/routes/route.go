package routes

import (
	"fmt"
	"net/http"
	"pac-man/back/handlers"
)

func Routers() {
	http.HandleFunc("/", handlers.HomeHandler)

	http.HandleFunc("/addScore", handlers.AddScore)
	http.HandleFunc("/boardScore", handlers.DisplayBoard)

	fmt.Println("kk")
}
