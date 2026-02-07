package database

const newPayrateSQL = `
	INSERT INTO pay_rates (
		id, effective_date, cfi_rate, admin_rate, last_updated
	) VALUES (?, ?, ?, ?, ?)
`
// NOTE: Example rate struct
// type PayRate struct {
// 	EffectiveDate string  `json:"effective_date"`
// 	CFIRate       float64 `json:"cfi_rate"`
// 	AdminRate     float64 `json:"admin_rate"`
// 	LastUpdated   string  `json:"last_updated"`
// }

// CreatePayRate -
func (database *Database) CreatePayRate(r PayRate) Response {
	// newID = 1 // TODO: obtain ID by querying table?
	// result, err := database.Exec(newPayrateSQL,
	// 	newID,
	// 	r.EffectiveDate,
	// 	r.CFIRate,
	// 	r.AdminRate,
	// 	r.LastUpdated,
	// )
	// if err != nil {
	// 	fmt.Printf("Error! %v\n", err)
	// 	return Response{
	// 		Status: "Error",
	// 		Message: fmt.Sprintf("error updating payrates: %v", err)
	// 	}
	// }
	//
	// // TODO: this line and below are still unchanged
	return Response{
		Status:  "OK",
		Message: "Pay rate created (TODO)",
	}
}

// GetRates -
func (database *Database) GetRates(checkID int) ([]PayRate, error) {
	return nil, nil
}

// // UpdatePayRates -
// func (database *Database) UpdatePayRates() error {
// 	// TODO: should present user with current rates pre-filled? or perhaps used
// 	// as shadow vals and then each can be overridden/written in by user
// }

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

// func (database *Database) NewEntry(entry Entry) Response {
// 	result, err := database.Exec(newEntrySQL,
// 		payPeriod.ID,
// 		entry.Type,
// 		entry.Date,
// 		entry.Time,
// 		nilCheck(entry.FlightHours),
// 		nilCheck(entry.GroundHours),
// 		nilCheck(entry.SimHours),
// 		nilCheck(entry.AdminHours),
// 		nilCheck(entry.Customer),
// 		nilCheck(entry.Notes),
// 		nilCheck(entry.RideCount),
// 		entry.Meeting,
// 	)
// 	if err != nil {
// 		fmt.Printf("Error! %v\n", err)
// 		return Response{
// 			Status:  "ERROR",
// 			Message: fmt.Sprintf("error creating entry: %v", err),
// 		}
// 	}
//
// 	newID, err := result.LastInsertId()
// 	if err != nil {
// 		fmt.Printf("Error, ID unknown! %v\n", err)
// 		return Response{
// 			Status:  "ERROR",
// 			Message: fmt.Sprintf("created entry, ID error: %v", err),
// 		}
// 	}
//
// 	err = database.UpdatePayPeriodTotals(payPeriod.ID)
// 	if err != nil {
// 		log.Printf("Warning: failed to update pay period totals: %v", err)
// 	}
//
// 	log.Printf("Created entry ID: %d\n", newID)
// 	return Response{
// 		Status:  "OK",
// 		Message: "New entry created:",
// 		Data:    json.RawMessage(fmt.Sprintf(`{"entry_id": %d}`, newID)),
// 	}
// }
