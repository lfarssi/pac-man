package handlers

import (
	"encoding/json"
	"net/http"
	"os"
)

type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}

func AddScore(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var entry ScoreEntry
	if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	var scores []ScoreEntry
	filePath := "./back/scores.json"
	if _, err := os.Stat(filePath); err == nil {
		file, err := os.ReadFile(filePath)
		if err == nil {
			_ = json.Unmarshal(file, &scores)
		}
	}




	data, err := json.MarshalIndent(scores, "", "  ")
	if err != nil {
		http.Error(w, "Failed to encode scores", http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		http.Error(w, "Failed to save score", http.StatusInternalServerError)
		return
	}

	w.Write([]byte("Score saved successfully"))
}

