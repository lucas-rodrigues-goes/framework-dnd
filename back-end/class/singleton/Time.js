

//=====================================================================================================
// Time Class
//=====================================================================================================
var Time = class {

    // Stored Attributes
    static #data = MapTool.tokens.getTokenByID("EF3758F4A9B5426C8FB3437CF5DA0183")

    static get _object () {
        return JSON.parse(this.#data.getProperty("object")) || {}
    }

    static set _object (obj) {
        this.#data.setProperty("object", JSON.stringify(obj))
    }

    static get _seconds () {
        return this._object.seconds || 0
    }

    static set _seconds (value) {
        const obj = this._object
        obj.seconds = value
        this._object = obj
    }
    
    // Getters
    static get current() {
        return this._seconds
    }

    static get json() {
        return JSON.stringify(this.#breakdown(this._seconds), null, 2)
    }

    // Setters
    static set current(current) {
        this._seconds = this.#roundSeconds(current)
    }

    // Methods
    static increase() {
        // Build units list with capitalized labels
        const unit_keys = Object.keys(TimeUnit.UNITS)
        const unit_labels = unit_keys.map(u => u.charAt(0).toUpperCase() + u.slice(1))

        const user_input = input({
            amount: {
                value: 0,
                label: `Amount`,
                type: "text",
                options: { width: 8 }
            },
            unit: {
                value: unit_labels.join(","),
                label: "Choose Time Unit",
                type: "list",
                options: {
                    delimiter: ",",
                    value: "string",
                    select: 0
                }
            }
        })

        // Convert back from capitalized label to original key
        const { unit: selected_label, amount } = user_input
        const index = unit_labels.indexOf(selected_label)
        const unit = unit_keys[index]

        // Convert to seconds using TimeUnit
        const total_seconds = TimeUnit[unit + "s"](Number(amount))

        // Apply the increase
        this._seconds = this.#roundSeconds(this._seconds + total_seconds)
        
        // Check for expired conditions on all creatures
        this.check_all_creature_conditions()
    }


    static set() {
        // Custom month names
        const months = [
            "Hammer", "Alturiak", "Ches", 
            "Tarsakh", "Mirtul", "Kythorn", 
            "Flamerule", "Eleasis", "Eleint",
            "Marpenoth", "Uktar", "Nightal"
        ]

        // Get current breakdown of time in units
        const current = JSON.parse(this.json)

        // Build input fields for each unit with defaults
        const fields = {
            year:   { value: (current.year ?? 0) + 1, label: "Year",   type: "text", options: { width: 5 } },
            month:  { 
                value: months.join(","), 
                label: "Month", 
                type: "list", 
                options: {
                    delimiter: ",",
                    value: "number",
                    select: (current.month ?? 0) // default to current month index
                }
            },
            day:    { value: (current.day ?? 0) + 1, label: "Day",    type: "text", options: { width: 5 } },
            hour:   { value: current.hour   ?? 0, label: "Hour",   type: "text", options: { width: 5 } },
            minute: { value: current.minute ?? 0, label: "Minute", type: "text", options: { width: 5 } },
            round:  { value: current.round  ?? 0, label: "Round",  type: "text", options: { width: 5 } },
            second: { value: current.second ?? 0, label: "Second", type: "text", options: { width: 5 } }
        }

        // Show input dialog
        const values = input(fields)

        // Convert to total seconds
        let total_seconds = 0
        total_seconds += TimeUnit.years(Number(values.year) - 1)
        total_seconds += TimeUnit.months(values.month)
        total_seconds += TimeUnit.days(Number(values.day) - 1)
        total_seconds += TimeUnit.hours(Number(values.hour))
        total_seconds += TimeUnit.minutes(Number(values.minute))
        total_seconds += TimeUnit.rounds(Number(values.round))
        total_seconds += TimeUnit.seconds(Number(values.second))

        // Replace the stored time
        this._seconds = this.#roundSeconds(total_seconds)
        
        // Check for expired conditions on all creatures
        this.check_all_creature_conditions()
    }

    // Check all creature conditions for expiration
    static check_all_creature_conditions() {
        try {
            const creatures = mapCreatures();
            let total_expired = 0;
            
            for (const creature of creatures) {
                if (creature && typeof creature.check_expired_conditions === 'function') {
                    const had_expired = creature.check_expired_conditions();
                    if (had_expired) total_expired++;
                }
            }
            
            if (total_expired > 0) {
                console.log(`Time advanced: ${total_expired} creature(s) had expired conditions removed.`, "debug");
            }
        } catch (error) {
            console.log(`Error checking creature conditions: ${error.message}`, "debug");
        }
    }



    // Helpers
    static #roundSeconds(seconds) {
        // Round seconds, but keep 0.5 exactly as 0.5
        const fractional = seconds % 1;
        if (fractional === 0.5) {
            return seconds; // Keep exactly 0.5
        } else {
            return Math.round(seconds); // Round all other fractional seconds
        }
    }

    static #breakdown(seconds) {
        let remaining = seconds
        const breakdown = {}

        const units = Object.entries(TimeUnit.UNITS).sort((a, b) => b[1] - a[1])
        for (const [unit, factor] of units) {
            const count = Math.floor(remaining / factor)
            breakdown[unit] = count
            remaining -= count * factor
        }

        // Keep fractional seconds (now properly rounded)
        breakdown.second += remaining
        return breakdown
    }
}


//=====================================================================================================
// TimeUnit Class
//=====================================================================================================
var TimeUnit = class {

    static UNITS = {
        year:   31104000,
        month:  2592000,
        day:    86400,
        hour:   3600,
        minute: 60,
        round:  6,
        second: 1
    }

    // Forward conversions (to seconds)
    static seconds(value) { return value * this.UNITS.second }
    static rounds(value)  { return value * this.UNITS.round }
    static minutes(value) { return value * this.UNITS.minute }
    static hours(value)   { return value * this.UNITS.hour }
    static days(value)    { return value * this.UNITS.day }
    static months(value)  { return value * this.UNITS.month }
    static years(value)   { return value * this.UNITS.year }

    // Reverse conversions (from seconds)
    static toSeconds(value) { return value / this.UNITS.second }
    static toRounds(value)  { return value / this.UNITS.round }
    static toMinutes(value) { return value / this.UNITS.minute }
    static toHours(value)   { return value / this.UNITS.hour }
    static toDays(value)    { return value / this.UNITS.day }
    static toMonths(value)  { return value / this.UNITS.month }
    static toYears(value)   { return value / this.UNITS.year }
}
