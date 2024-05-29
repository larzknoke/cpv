// Work Status
export const wortStatusQuery = `
        from(bucket: "iobroker")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.35140_Work_status")
          |> filter(fn: (r) => r["_field"] == "value")
          |> last()`;

// Ertrag "Heute"
export const dailyPowerQuery = `
        from(bucket: "iobroker")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.35003_Daily_power_yields")
          |> filter(fn: (r) => r["_field"] == "value")
          |> last()`;

// Ertrag "Tag" für eine Woche
export const weeklyPowerQuery = `
        import "experimental/date/boundaries"
        currentWeek = boundaries.week(week_offset: 0)
        from(bucket: "iobroker")
            |> range(start: currentWeek.start, stop: currentWeek.stop)
            |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.Tagesmenge")
            |> filter(fn: (r) => r["_field"] == "value")
          `;

// Ertrag "Tag" für eine Woche
export const monthPowerQuery = `
        import "date"
        currentYearString = string(v: date.year(t: now()))
        currentYear = time(v: currentYearString + "-01-01")
        from(bucket: "iobroker")
            |> range(start: currentYear)
            |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.Monatsmenge")
            |> filter(fn: (r) => r["_field"] == "value")
          `;

// Ertrag "aktueller Monat"
export const currentMonthPowerQuery = `
        from(bucket: "iobroker")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.35128_Monthly power yields")
          |> filter(fn: (r) => r["_field"] == "value")
          |> last()`;
