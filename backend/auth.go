package main

import (
	"crypto/subtle"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at"`
}

var Sessions = make(map[string]Session)
var SessionDuration = 30 * 24 * time.Hour

// guards Sessions: handlers run concurrently, and unsynchronized map access can crash the server
var sessionsMu sync.RWMutex

func createSession(username string) Session {
	newSession := uuid.New().String()
	session := Session{
		ID:        newSession,
		Username:  username,
		CreatedAt: time.Now().Format(time.RFC3339),
		ExpiresAt: time.Now().Add(SessionDuration).Format(time.RFC3339),
	}
	sessionsMu.Lock()
	Sessions[newSession] = session
	sessionsMu.Unlock()
	return session
}

func deleteSession(id string) {
	sessionsMu.Lock()
	delete(Sessions, id)
	sessionsMu.Unlock()
}

func validateSession(id string) bool {
	sessionsMu.RLock()
	session, exists := Sessions[id]
	sessionsMu.RUnlock()
	if !exists {
		return false
	}

	expiresAt, err := parseTime(session.ExpiresAt)
	if err != nil {
		return false
	}

	return time.Now().Before(expiresAt)
}

// constant-time compare; empty configured credentials never match
func credentialsMatch(user, pass, wantUser, wantPass string) bool {
	if wantUser == "" || wantPass == "" {
		return false
	}
	userOK := subtle.ConstantTimeCompare([]byte(user), []byte(wantUser)) == 1
	passOK := subtle.ConstantTimeCompare([]byte(pass), []byte(wantPass)) == 1
	return userOK && passOK
}

func parseTime(timeString string) (time.Time, error) {
	parsedTime, err := time.Parse(time.RFC3339, timeString)
	if err != nil {
		log.Println("Error parsing time")
		return time.Time{}, err
	}
	return parsedTime, nil
}
