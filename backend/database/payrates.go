package database

import "fmt"

const newPayrateSQL = `
	INSERT INTO pay_rates (
		effective_date, cfi_rate, admin_rate
	) VALUES (?, ?, ?)
`

// CreatePayRate -
func (database *Database) CreatePayRate(r PayRate) Response {
	_, err := database.Exec(newPayrateSQL,
		r.EffectiveDate,
		r.CFIRate,
		r.AdminRate,
	)
	if err != nil {
		fmt.Printf("Error! %v\n", err)
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("error creating payrate: %v", err),
		}
	}

	return Response{
		Status:  "OK",
		Message: "Pay rate created",
	}
}
