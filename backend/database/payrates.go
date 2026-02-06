package database

// NOTE: example table schema
// CREATE TABLE IF NOT EXISTS pay_rates (
//     id INTEGER PRIMARY KEY,
//     effective_date DATE NOT NULL,
//     cfi_rate DECIMAL(6,2) NOT NULL,
//     admin_rate DECIMAL(6,2) NOT NULL,
//     last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

const newPayRateSQL = `
	INSERT INTO pay_rates (
		id, effective_date, cfi_rate, admin_rate, last_updated
	) VALUES (?, ?, ?, ?, ?)
`

func (database *Database) CreatePayRate(rate PayRate) Response {
	return Response{
		Status:  "OK",
		Message: "Pay rate created (TODO)",
	}
}

func (database *Database) GetRates(checkID int) ([]PayRate, error) {
	return nil, nil
}

// // UpdatePayPeriodStatus -
// func (db *Database) UpdatePayPeriodStatus() error {
// 	query := `
// 		SELECT id FROM pay_periods
// 		WHERE ? BETWEEN start_date AND end_date
// 		ORDER BY start_date DESC
// 		LIMIT 1
// 	`
//
// 	var currentPeriodID int
// 	today := time.Now().Format("2006-01-02")
// 	err := db.QueryRow(query, today).Scan(&currentPeriodID)
//
// 	if err != nil {
// 		return nil
// 	}
//
// 	updateQuery := `UPDATE pay_periods SET status = 'past' WHERE id != ?`
// 	_, err = db.Exec(updateQuery, currentPeriodID)
// 	if err != nil {
// 		return fmt.Errorf("failed to update period statuses: %v", err)
// 	}
//
// 	currentQuery := `UPDATE pay_periods SET status = 'current' WHERE id = ?`
// 	_, err = db.Exec(currentQuery, currentPeriodID)
// 	if err != nil {
// 		return fmt.Errorf("failed to set current period: %v", err)
// 	}
//
// 	return nil
// }
