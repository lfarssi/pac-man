package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"sort"
	"strconv"
)

func DisplayBoard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "GET only", http.StatusMethodNotAllowed)
		return
	}

	pageStr := r.URL.Query().Get("page")
	page := 1
	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}

	data, err := os.ReadFile("./back/scores.json")
	if err != nil {
		http.Error(w, "Could not read scores", http.StatusInternalServerError)
		return
	}
	var scores []ScoreEntry
	_ = json.Unmarshal(data, &scores)

	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	type RankedEntry struct {
		Rank  int    `json:"rank"`
		Name  string `json:"name"`
		Score int    `json:"score"`
		Time  string `json:"time"`
	}
	var ranked []RankedEntry
	for i, entry := range scores {
		ranked = append(ranked, RankedEntry{
			Rank:  i + 1,
			Name:  entry.Name,
			Score: entry.Score,
			Time:  entry.Time,
		})
	}

	const pageSize = 5
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > len(ranked) {
		start = len(ranked)
	}
	if end > len(ranked) {
		end = len(ranked)
	}
	paged := ranked[start:end]


	json.NewEncoder(w).Encode(struct {
		TotalScores int           `json:"totalScores"`
		Page        int           `json:"page"`
		TotalPages  int           `json:"totalPages"`
		Scores      []RankedEntry `json:"scores"`
	}{
		TotalScores: len(scores),
		Page:        page,
		TotalPages:  (len(scores) + pageSize - 1) / pageSize,
		Scores:      paged,
	})
}
