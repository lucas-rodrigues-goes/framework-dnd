

var Monster = class extends Creature {

    //=====================================================================================================
    // Default Parameters
    //=====================================================================================================

    #challenge_rating = "0"
    #max_health = 0
    #condition_immunities = []
    #resistances = {}
    #armor_class = 10
    #initiative_mod = 0

    //=====================================================================================================
    // Monster Creation
    //=====================================================================================================

    temporary_create_screen() {
        // Build the input fields
        const fields = {
            name:       { label: "Name", type: "text", value: "" },
            type:       { label: "Type", type: "text", value: "" },
            race:       { label: "Race", type: "text", value: "" },
            max_health: { label: "Max Health", type: "text", value: "1" },
            challenge_rating: { label: "Challenge Rating", type: "text", value: "0" },
            armor_class: {label: "Armor Class", type: "text", value: "10"},
            initiative_mod: {label: "Initiative Mod", type: "text", value: "0"},
            speed:      { label: "Speed", type: "text", value: "30" },

            // Ability Scores (default 10)
            str: { label: "Strength", type: "text", value: "10" },
            dex: { label: "Dexterity", type: "text", value: "10" },
            con: { label: "Constitution", type: "text", value: "10" },
            int: { label: "Intelligence", type: "text", value: "10" },
            wis: { label: "Wisdom", type: "text", value: "10" },
            cha: { label: "Charisma", type: "text", value: "10" },

            // Extra fields
            proficiencies: { label: "Proficiencies", type: "text", value: "" },
            features:      { label: "Features", type: "text", value: "" },
        };

        // Run the input macro
        const result = input(fields);

        // Parse ability scores
        const ability_scores = {
            STR: parseInt(result.str) || 10,
            DEX: parseInt(result.dex) || 10,
            CON: parseInt(result.con) || 10,
            INT: parseInt(result.int) || 10,
            WIS: parseInt(result.wis) || 10,
            CHA: parseInt(result.cha) || 10,
        };

        // Parse proficiencies
        const proficiencies = {};
        if (result.proficiencies && result.proficiencies.trim() !== "") {
            for (const entry of result.proficiencies.split(", ")) {
                const [name, level] = entry.split(":");
                if (name && level) {
                    proficiencies[name.trim()] = parseInt(level.trim()) || 0;
                }
            }
        }

        // Parse features
        const features = result.features
            ? result.features.split(", ").map(f => f.trim()).filter(f => f.length > 0)
            : [];

        // Call create method
        this.create({
            name: result.name,
            type: result.type,
            race: result.race,
            max_health: parseInt(result.max_health) || 1,
            challenge_rating: result.challenge_rating,
            armor_class: result.armor_class,
            initiative_mod: result.initiative_mod,
            speed: result.speed,
            ability_scores,
            proficiencies,
            features,
        });
    }

    create({
        name, 
        type, 
        race, 
        max_health, 
        challenge_rating,
        armor_class,
        initiative_mod,
        speed, 

        ability_scores, // {} where KEY=Score Name, VALUE=Value
        proficiencies, // {} where KEY=Proficiency, VALUE=Level
        features, // [] of feature names
    }) {
        // Ability Scores
        if (ability_scores) {
            for (const [score, value] of Object.entries(ability_scores)) {
                this.set_ability_score(score, value)
            }
        }

        // Proficiencies
        if (proficiencies) {
            for (const [proficiency, level] of Object.entries(proficiencies)) {
                this.set_proficiency(proficiency, level, true)
            }
        }

        // Features
        if (features) {
            for (const name of features) {
                this.add_feature(name)
            }
        }

        // Set basic information
        this.name = name
        this.type = type
        this.race = race
        this.max_health = max_health
        this.challenge_rating = challenge_rating
        this.#armor_class = armor_class
        this.#initiative_mod = initiative_mod 
        this.speed = speed

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

    get challenge_rating() {
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

    set challenge_rating(cr) {
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
    // Resistances
    //=====================================================================================================

    get resistances() {
        // Gather calculated resistances from Creature
        let resistances = super.resistances

        // Helper function to apply resistances
        const applyResistancesOfObject = (object) => {
            // Type Priority
            const priority = {
                heals: 4,
                immunity: 3,
                weakness: 2,
                resistance: 1
            };

            for (const damage_type in object) {
                const resistance = object[damage_type];
                
                // Skip if damage type not in our base resistances
                if (!resistances[damage_type]) continue;

                // If priority of new type greater or equal current type
                resistance.type = resistance.type || "resistance";
                const samePriority = priority[resistance.type] == priority[resistances[damage_type].type];

                // If both are of level resistance keep one with highest resistance
                if (samePriority && resistance.type == "resistance") {
                    if (resistance.reduction > resistances[damage_type].reduction) {
                        resistances[damage_type] = resistance;
                    }
                }
                // If new resistance priority is higher
                else if (priority[resistance.type] > priority[resistances[damage_type].type]) {
                    resistances[damage_type] = resistance;
                }
            }
        };

        // Apply monster resistances
        applyResistancesOfObject(this.#resistances)
    }

    set resistances(resistances) {
        if(!Object.prototype.toString.call(resistances) === "[object Object]") return

        this.#resistances = resistances
    }

    //=====================================================================================================
    // Armor Class and Initiative
    //=====================================================================================================

    get armor_type() {
        return "None"
    }

    get initiative_mod() {
        return this.#initiative_mod
    }

    get armor_class_detail() {
        const base = this.#armor_class

        // Condition Bonus
        let condition_bonus = 0; {
            for (const name in this.conditions) {
                const condition = this.conditions[name]
                if (condition.bonus_armor_class) condition_bonus += condition.bonus_armor_class
            }
        }

        // Total armor class
        let total = base + condition_bonus

        return {total, base, condition_bonus}
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