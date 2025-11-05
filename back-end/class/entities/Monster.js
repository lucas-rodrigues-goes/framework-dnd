

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

    #spellcasting_class = ""

    //=====================================================================================================
    // Monster Creation
    //=====================================================================================================

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

        spellcasting_level,
        spellcasting_class,
        spells,
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
                if (!this.has_feature(name)) this.add_feature(name)
            }
        }

        // Spells
        if (spellcasting_class) {
            // Fix structure if needed
            if (!spells[spellcasting_class]) spells[spellcasting_class] = {}
            for (const key of ["known", "always_prepared", "innate"]) {
                if (!spells[spellcasting_class][key]) spells[spellcasting_class][key] = []
            }

            // Reset current spells structure
            this.reset_spells()

            // Learn all spells
            const class_spells = spells[spellcasting_class]
            const all_spells = [
                ...class_spells.known,
                ...class_spells.always_prepared,
                ...class_spells.innate
            ]
            for (const name of all_spells) {
                this.learn_spell(spellcasting_class, name)
            }

            // Set always prepared and innate
            for (const name of class_spells.always_prepared) {
                this.set_always_prepared_spell(spellcasting_class, name)
            }
            for (const name of class_spells.innate) {
                this.set_innate_spell(spellcasting_class, name)
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
        this.spellcasting_class = spellcasting_class
        this.spellcasting_level = spellcasting_level

        // Fill Resources
        this.update_spell_slots()
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
        return resistances
    }

    set resistances(resistances) {
        if(!Object.prototype.toString.call(resistances) === "[object Object]") return

        this.#resistances = resistances
    }

    //=====================================================================================================
    // Armor Class and Initiative
    //=====================================================================================================

    get initiative_mod() {
        let init_mod = super.initiative_mod + this.#initiative_mod
        init_mod = Math.max(init_mod, 0)

        return init_mod
    }

    get armor_class_detail() {
        const armor_class_detail = super.armor_class_detail
        const { total, condition_bonus } = armor_class_detail
        const natural_ac = this.#armor_class
        const natural_total = natural_ac + condition_bonus

        // Follow default calculation if it is better than hardcoded AC
        if (natural_total > total) {
            return {
                total: natural_total,
                base: natural_ac,
                condition_bonus,
                armor: 0,
                unnarmored_bonus: 0,
                dex_mod: 0,
                equipment_bonus: 0
            }
        }
        else {
            return armor_class_detail
        }
    }

    //=====================================================================================================
    // Spellcasting
    //=====================================================================================================

    get spellcasting_class () {
        return this.#spellcasting_class
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
        this.#resistances = object.resistances ?? this.#resistances
        this.#armor_class = object.armor_class ?? this.#armor_class
        this.#initiative_mod = object.initiative_mod ?? this.#initiative_mod
        this.#spellcasting_class = object.spellcasting_class ?? this.#spellcasting_class
    
        this.token.setProperty("class", JSON.stringify(["Monster", "Creature", "Entity"]));
    }
    
    save() {
        const object = {
            ...super.save(),
            challenge_rating: this.#challenge_rating,
            max_health: this.#max_health,
            condition_immunities: this.#condition_immunities,
            resistances: this.#resistances,
            armor_class: this.#armor_class,
            initiative_mod: this.#initiative_mod,
            spellcasting_class: this.#spellcasting_class
        }
        
        this.token.setProperty("class", JSON.stringify(["Monster", "Creature", "Entity"]));
        this.token.setProperty("object", JSON.stringify(object));
    }

    //=====================================================================================================
}