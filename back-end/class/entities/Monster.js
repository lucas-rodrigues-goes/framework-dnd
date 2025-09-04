

var Monster = class extends Creature {

    //=====================================================================================================
    // Default Parameters
    //=====================================================================================================

    #challenge_rating = 0
    #max_health = 0
    #condition_immunities = []

    //=====================================================================================================
    // Monster Creation
    //=====================================================================================================

    create({}) {
        // Ability Scores
        if (ability_scores) {
            for (const [score, value] of Object.entries(ability_scores)) {
                this.set_ability_score(score, value)
            }
        }

        // Set basic information
        this.name = name
        this.race = race

        // Add class
        if (character_class) { this.level_up(character_class, class_choices) }

        // Fill Resources
        this.long_rest()
    }

    //=====================================================================================================
    // Health
    //=====================================================================================================

    get max_health() {
        return this.#max_health
    }

    set max_health(max_health) {
        this.#max_health = max_health
    }

    //=====================================================================================================
    // Challenge Rating
    //=====================================================================================================

    get cr() {
        return this.#challenge_rating
    }

    get exp() {
        const cr_to_exp = {
            "0": 10,   // multiple options
            "1/8": 25,
            "1/4": 50,
            "1/2": 100,
            "1": 200,
            "2": 450,
            "3": 700,
            "4": 1100,
            "5": 1800,
            "6": 2300,
            "7": 2900,
            "8": 3900,
            "9": 5000,
            "10": 5900,
            "11": 7200,
            "12": 8400,
            "13": 10000,
            "14": 11500,
            "15": 13000,
            "16": 15000,
            "17": 18000,
            "18": 20000,
            "19": 22000,
            "20": 25000,
            "21": 33000,
            "22": 41000,
            "23": 50000,
            "24": 62000,
            "25": 75000,
            "26": 90000,
            "27": 105000,
            "28": 120000,
            "29": 135000,
            "30": 155000
        };

        const cr = this.#challenge_rating;

        if (!(cr in cr_to_exp)) return 0;

        return cr_to_exp[cr];
    }

    set cr(cr) {
        const valid_options = [
            "0", "1/8", "1/4", "1/2",
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
            "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
            "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"
        ]
        if (!valid_options.includes(cr)) return

        this.#challenge_rating = cr
    }

    //=====================================================================================================
    // Instance
    //=====================================================================================================

    constructor(id, reset, inherit) {
        super(id, reset, true);
        
        // Reset validation
        const noObject = String(this.token.getProperty("object")) === "null"
        const notMonster = String(this.token.getProperty("class")) !== "null"
            ? !JSON.parse(this.token.getProperty("class")).includes("Monster")
            : true

        const needsReset = noObject || reset || notMonster
        if (needsReset) {
            this.name = this.token.getName();
            if (!inherit) this.save()
        } else {
            if (!inherit) this.load()
        }
    }

    //=====================================================================================================
    // MapTool sync
    //=====================================================================================================

    load() {
        super.load()
        const object = JSON.parse(this.token.getProperty("object"));
    
        this.#challenge_rating = object.challenge_rating || this.#challenge_rating
        this.#max_health = object.max_health ?? this.#max_health
        this.#condition_immunities = object.condition_immunities ?? this.#condition_immunities
    
        this.token.setProperty("class", JSON.stringify(["Humanoid", "Creature", "Entity"]));
    }
    
    save() {
        const object = {
            ...super.save(),
            experience: this.experience,
            classes: this.classes,
        }
        
        this.token.setProperty("class", JSON.stringify(["Monster", "Creature", "Entity"]));
        this.token.setProperty("object", JSON.stringify(object));
    }

    //=====================================================================================================
}