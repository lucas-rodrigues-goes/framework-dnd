

//=====================================================================================================
// Time Class
//=====================================================================================================
var Time = class {

    // Stored Attributes
    static #data = MapTool.tokens.getTokenByID("tokenId")

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

    // Methods
    static increase(value) {
        this._seconds = this._seconds + value
    }

    static decrease(value) {
        this._seconds = this._seconds - value
    }

    // Helpers
    static #breakdown(seconds) {
        let remaining = seconds
        const breakdown = {}

        const units = Object.entries(TimeUnit.UNITS).sort((a, b) => b[1] - a[1])
        for (const [unit, factor] of units) {
            const count = Math.floor(remaining / factor)
            breakdown[unit] = count
            remaining -= count * factor
        }

        // Keep fractional seconds
        breakdown.second += remaining
        return breakdown
    }

    // Getters
    static get current() {
        return this._seconds
    }

    static get json() {
        return JSON.stringify(this.#breakdown(this._seconds), null, 2)
    }
}


//=====================================================================================================
// TimeUnit Class
//=====================================================================================================
var TimeUnit = class {

    static UNITS = {
        year:   31104000,
        month:  2592000,
        week:   864000,
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
    static weeks(value)   { return value * this.UNITS.week }
    static months(value)  { return value * this.UNITS.month }
    static years(value)   { return value * this.UNITS.year }

    // Reverse conversions (from seconds)
    static toSeconds(value) { return value / this.UNITS.second }
    static toRounds(value)  { return value / this.UNITS.round }
    static toMinutes(value) { return value / this.UNITS.minute }
    static toHours(value)   { return value / this.UNITS.hour }
    static toDays(value)    { return value / this.UNITS.day }
    static toWeeks(value)   { return value / this.UNITS.week }
    static toMonths(value)  { return value / this.UNITS.month }
    static toYears(value)   { return value / this.UNITS.year }
}
