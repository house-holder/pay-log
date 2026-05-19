package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	db "github.com/house-holder/pay-log/backend/database"
	"github.com/joho/godotenv"
	"go.yaml.in/yaml/v3"
)

type Ports struct {
	Backend    string `yaml:"backend"`
	Frontend   string `yaml:"frontend"`
	Production string `yaml:"production"`
}

type SiteConfig struct {
	Ports Ports `yaml:"ports"`
}

func loadConfig() (*SiteConfig, error) {
	data, err := os.ReadFile(os.Getenv("CONFIG_PATH"))
	if err != nil {
		return nil, fmt.Errorf("failed to read config: %w", err)
	}
	var cfg SiteConfig
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}
	return &cfg, nil
}

func openDB(dbPath string) *db.Database {
	fmt.Println("\x1b[33m" + "server startup" + "\x1b[0m")

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		database, err := db.Connect(dbPath)
		if err != nil {
			fmt.Printf(err.Error())
			log.Fatal("database creation failed")
		}
		fmt.Printf("\x1b[32m"+"new database created at '%s'"+"\x1b[0m\n", dbPath)
		return database
	}

	database, err := db.Connect(dbPath)
	if err != nil {
		fmt.Printf(err.Error())
		log.Fatal("database connection failed")
	}
	fmt.Println("\x1b[32m" + "database initialized" + "\x1b[0m")
	return database
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env")
	}

	database := openDB(os.Getenv("DATABASE_PATH"))
	defer database.Close()

	cfg, err := loadConfig()
	if err != nil {
		log.Fatal("failed to load config: ", err)
	}

	env := os.Getenv("ENVIRONMENT")
	isProd := env == "production"
	DevMode = !isProd

	port := cfg.Ports.Backend
	if isProd && cfg.Ports.Production != "" {
		port = cfg.Ports.Production
	}

	http.HandleFunc("/api/auth-ok", auth(setupAuthOK()))
	http.HandleFunc("/api/login", setupLogin(isProd))
	http.HandleFunc("/api/new", auth(setupNewEntry(database)))
	http.HandleFunc("/api/edit", auth(setupEditEntry(database)))
	http.HandleFunc("/api/delete", auth(setupDeleteEntry(database)))
	http.HandleFunc("/api/health", setupCheckHealth(database))
	http.HandleFunc("/api/current-period", auth(setupCurrentPeriod(database)))
	http.HandleFunc("/api/periods", auth(setupGetAllPeriods(database)))
	http.HandleFunc("/api/get-entries", auth(setupGetEntries(database)))
	http.HandleFunc("/api/get-totals", auth(setupGetTotals(database)))
	http.HandleFunc("/api/pay-rates", auth(setupCreatePayRate(database)))
	http.HandleFunc("/api/pay-rates/current", auth(setupGetCurrentRates(database)))

	fmt.Printf("\x1b[32m"+"running (:%s)"+"\x1b[0m\n", port)

	if isProd {
		fs := http.FileServer(http.Dir(os.Getenv("STATIC_DIR")))
		http.Handle("/", fs)
		fmt.Println("Prod mode")
	} else {
		fmt.Println("Dev mode: API-only ops")
	}

	log.Fatal(http.ListenAndServe(fmt.Sprintf("0.0.0.0:%s", port), nil))
}
