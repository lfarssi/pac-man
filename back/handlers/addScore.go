package handlers

import (
	"fmt"
	"net/http"
)

func AddScore(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Methode not allowed")
		return 
	}
	

}
