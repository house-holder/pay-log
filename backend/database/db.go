package database

import (
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	*sql.DB
}

func Connect(path string) (*Database, error) {
	sqlDB, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	database := &Database{sqlDB}
	if err := database.createTables(); err != nil {
		return nil, err
	}
	if err := database.UpdatePayPeriodStatus(); err != nil {
		return nil, fmt.Errorf("failed to update period statuses: %w", err)
	}

	response := database.CheckHealth()
	if response.Status != "OK" {
		return nil, fmt.Errorf(
			"database init failed: %s",
			response.Message,
		)
	}
	return database, nil
}

func (database *Database) createTables() error {
	_, err := database.Exec(`
		CREATE TABLE IF NOT EXISTS pay_entries (
			id INTEGER PRIMARY KEY,
			pay_period_id INTEGER,
			type TEXT NOT NULL,
			date DATE NOT NULL,
			time TIME,
			flight_hours DECIMAL(4,2) DEFAULT NULL,
			ground_hours DECIMAL(4,2) DEFAULT NULL,
			sim_hours DECIMAL(4,2) DEFAULT NULL,
			admin_hours DECIMAL(4,2) DEFAULT NULL,
			customer TEXT,
			notes TEXT,
			ride_count INTEGER DEFAULT NULL,
			meeting BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS pay_rates (
			id INTEGER PRIMARY KEY,
			effective_date DATE NOT NULL,
			cfi_rate DECIMAL(6,2) NOT NULL,
			admin_rate DECIMAL(6,2) NOT NULL,
			last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS pay_periods (
			id INTEGER PRIMARY KEY,
			start_date DATE NOT NULL,
			end_date DATE NOT NULL,
			pay_date DATE NOT NULL,
			expected_pay_gross DECIMAL(8,2),
			actual_pay_gross DECIMAL(8,2),
			actual_pay_net DECIMAL(8,2),
			status TEXT DEFAULT 'current',
			import_batch_id TEXT,
			last_updated TIMESTAMP DEFAULT NULL,
			UNIQUE(start_date, end_date)
		);

		CREATE TABLE IF NOT EXISTS monthly_stats (
			id INTEGER PRIMARY KEY,
			year INTEGER NOT NULL,
			month INTEGER NOT NULL,
			total_flight_hours DECIMAL(6,2),
			total_ground_hours DECIMAL(6,2),
			total_admin_hours DECIMAL(6,2),
			total_gross_pay DECIMAL(8,2),
			last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(year, month)
		);
	`)
	if err != nil {
		return fmt.Errorf("table creation failed: %w", err)
	}
	return nil
}

func (database *Database) CheckHealth() Response {
	if err := database.Ping(); err != nil {
		return Response{
			Status:  "DOWN",
			Message: fmt.Sprintf("database ping failed: %v", err),
		}
	}
	return Response{
		Status:  "OK",
		Message: "Database server is running.",
	}
}

func (database *Database) UpdatePaycheck(check Paycheck) Response {
	return Response{
		Status:  "OK",
		Message: "Paycheck updated (TODO)",
	}
}

func (database *Database) FetchEntries(beginDate string, endDate string) ([]Entry, error) {
	query := `
        SELECT id, type, date, time, flight_hours, ground_hours, sim_hours, 
               admin_hours, customer, notes, ride_count, meeting
        FROM pay_entries 
    `

	var args []any

	if beginDate != "all" && endDate != "all" {
		beginDate = strings.Split(beginDate, "T")[0]
		endDate = strings.Split(endDate, "T")[0]
		query += "WHERE date BETWEEN ? AND ?"
		args = []any{beginDate, endDate}
	}

	query += "ORDER BY date DESC, time DESC"

	rows, err := database.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch entries: %w", err)
	}
	defer rows.Close()

	var collectedEntries []Entry
	for rows.Next() {
		var entry Entry
		err := rows.Scan(
			&entry.ID, &entry.Type, &entry.Date, &entry.Time,
			&entry.FlightHours, &entry.GroundHours, &entry.SimHours,
			&entry.AdminHours, &entry.Customer, &entry.Notes,
			&entry.RideCount, &entry.Meeting,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan entry: %w", err)
		}
		collectedEntries = append(collectedEntries, entry)
	}

	if collectedEntries == nil {
		collectedEntries = []Entry{}
	}

	return collectedEntries, nil
}

func (database *Database) Close() error {
	err := database.DB.Close()
	if err != nil {
		return fmt.Errorf("error closing database: %w", err)
	}
	return nil
}
