package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
)

type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"` // "MM:SS"
}

func AddScore(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight request
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

	// Read existing scores if file exists
	var scores []ScoreEntry
	filePath := "./back/scores.json"
	if _, err := os.Stat(filePath); err == nil {
		file, err := os.ReadFile(filePath)
		if err == nil {
			_ = json.Unmarshal(file, &scores)
		}
	}

	scores = append(scores, entry)
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	var userRank int
	for i, s := range scores {
		if s.Name == entry.Name && s.Score == entry.Score && s.Time == entry.Time {
			userRank = i + 1
			break
		}
	}
	percentile := 100 - ((userRank - 1) * 100 / len(scores))
	fmt.Fprintf(w, "Congrats %s, you're in the top %d%%, on the %d%s position!",
	entry.Name, percentile, userRank, getOrdinal(userRank),
	)
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


func getOrdinal(n int) string {
	if n%10 == 1 && n%100 != 11 {
		return "st"
	} else if n%10 == 2 && n%100 != 12 {
		return "nd"
	} else if n%10 == 3 && n%100 != 13 {
		return "rd"
	}
	return "th"
}
