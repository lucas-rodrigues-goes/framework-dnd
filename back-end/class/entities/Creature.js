

var Creature = class extends Entity {

    //=====================================================================================================
    // Default Parameters
    //=====================================================================================================

    #name = ""
    #type = ""
    #race = ""
    #ability_scores = { "strength": 10, "dexterity": 10, "constitution": 10, "wisdom": 10, "intelligence": 10, "charisma": 10 }
    #health = 10
    #temporary_health = 0
    #speed = { "walk": 30, "climb": 15, "swim": 15, "fly": 0, "burrow": 0 }
    #spellcasting_level = 0
    #resources = {
        "Action": {
            value: 1,
            max: 1,
            restored_on: "turn start",
        },
        "Attack Action": {
            value: 0,
            max: 1,
        },
        "Bonus Action": {
            value: 1,
            max: 1,
            restored_on: "turn start",
        },
        "Reaction": {
            value: 1,
            max: 1,
            restored_on: "turn start",
        },
        "Movement": {
            value: 30,
            max: 30,
            restored_on: "turn start",
        },
    }
    #features = []
    #proficiencies = {}
    #spells = {}
    #conditions = {}
    #equipment = {
        "head": null,
        "body": null,
        "hands": null,
        "belt":null,
        "feet": null,
        "amulet": null,
        "right ring": null,
        "left ring": null,
        "cape": null,
        "ammunition": null,
        "primary main hand": null,
        "primary off hand": null,
        "secondary main hand": null,
        "secondary off hand": null
    }
    #inventory = Array.from({ length: 25 }, () => null);
    #notes = {}
    #attitude = "friendly" // friendly, neutral, hostile

    //=====================================================================================================
    // Basic Getters / Setters
    //=====================================================================================================

    get name() { return this.#name }
    set name(name) {
        this.#name = name

        this.save()

        log(this.#name + " updated their name.")
    }

    get name_color () {
        const color = this.player ? "#48BAFF" : "#C82E42"

        return `<span style="color: ${color}">${this.name}</span>`
    }

    get type() { return this.#type }
    set type(type) {
        this.#type = type

        this.save()

        log(this.#name + " type set to " + type + ".")
    }

    get race() { return this.#race }
    set race(race) {
        this.#race = race

        this.save()

        log(this.#name + " race set to " + race + ".")
    }

    get abilities() {return Abilities.abilities_list(this)}

    get attitude () {return this.#attitude}
    set attitude (value) {
        value = value.toLowerCase()
        if (["friendly", "hostile", "neutral"].includes(value)) this.#attitude = value
        this.save()
        this.update_state()
    }

    //=====================================================================================================
    // Buffs and Debuffs
    //=====================================================================================================

    roll_bonus() {
        const creature = this

        let output = 0; {
            // Bane
            if (creature.has_condition("Bane")) output -= roll_dice(1, 4)

            // Bless
            if (creature.has_condition("Bless")) output += roll_dice(1, 4)

            // Guidance
            if (creature.has_condition("Guidance")) {
                creature.remove_condition("Guidance")
                output += roll_dice(1, 4)
            }

            // Exhaustion
            if (creature.has_condition("Exhaustion")) {
                output -= this.exhaustion || 0
            }
        }

        return output
    }

    //=====================================================================================================
    // Events
    //=====================================================================================================

    onMove() {
        this.passive_search()
        this.maintain_stealth(false)

        // Grappling
        if (this.has_condition("Grappling")) {
            const condition = this.get_condition("Grappling")
            const target = instance(condition.target)
            const {offset} = condition

            target.x = this.x + offset.x
            target.y = this.y + offset.y

            this.face_target(target)
            target.face_target(this)
        }

        // Grappled
        if (this.has_condition("Grappled")) {
            const source = instance(this.get_condition("Grappled").source)

            // Remove grapple if distance is higher than melee
            if (calculate_distance(this, source) > 1) {
                this.remove_condition("Grappled")

                // Remove grappling condition from source, if the condition points to THIS
                if (source.get_condition("Grappling").target == this.id) source.remove_condition("Grappling")
            }
        }
    }

    //=====================================================================================================
    // Methods
    //=====================================================================================================

    update_state({daytime=undefined}={}) {
        try {

        // Update Health Bar
        function crunchNumber(num, from = [0, 100], to = [0, 100]) {
            // Define the input and output ranges
            const inputMin = from[0];
            const inputMax = from[1];
            const outputMin = to[0];
            const outputMax = to[1];
            
            // Calculate the proportion and map to new range
            const proportion = (num - inputMin) / (inputMax - inputMin);
            const crunched = outputMin + proportion * (outputMax - outputMin);
            
            return crunched;
        }
        const crunchedHealth = crunchNumber(this.health / this.max_health, [0, 1], [0.292, 0.708])
        const crunchedTempHealth = crunchNumber(this.temporary_health / this.max_health, [0, 1], [0.292, 0.708])
        const updateBars = (isDead) => {
            const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
            const healthBars = ["FriendlyHealth", "NeutralHealth", "HostileHealth"]
            const characterBar = capitalize(this.attitude)+"Health"

            if (isDead) {
                for (const bar of healthBars) {
                    MTScript.evalMacro(`[r: setBarVisible("${bar}", 0, "${this.id}") ]`)
                }
                MTScript.evalMacro(`[r: setBarVisible("TemporaryHealth", 0, "${this.id}") ]`)
            }
            else {
                for (const bar of healthBars) {
                    if (bar != characterBar)
                    MTScript.evalMacro(`[r: setBarVisible("${bar}", 0, "${this.id}") ]`)
                }
                MTScript.evalMacro(`[r: setBar("${characterBar}", ${crunchedHealth}, "${this.id}")]`)
                MTScript.evalMacro(`[r: setBar("TemporaryHealth", ${crunchedTempHealth}, "${this.id}")]`)
            }
        }
        
        // Verify all conditions
        for (const condition in database.conditions.data) {
            const hasCondition = this.has_condition(condition)
            switch (condition) {
                case "Blinded": {
                    let DEFAULT_TYPE; {
                        if (this.has_feature("Truesight")) DEFAULT_TYPE = "Truesight"
                        else if (this.has_feature("Invocation: Devil's Sight")) DEFAULT_TYPE = "Devil's Sight"
                        else if (this.has_feature("Superior Darkvision")) DEFAULT_TYPE = "Superior Darkvision"
                        else if (this.has_feature("Darkvision")) DEFAULT_TYPE = "Darkvision"
                        else DEFAULT_TYPE = "Normal"

                        const getMapVision = daytime || MTScript.evalMacro(`[r:getMapVision()]`)
                        const day_light = ["day", "dia"].includes(getMapVision.toLowerCase())
                        if (day_light) DEFAULT_TYPE += " Day"
                    }
                    this.sight = hasCondition ? "Blinded" : DEFAULT_TYPE
                    break
                }
                case "Dead": {
                    updateBars(hasCondition)
                    break
                }
                case "Hidden": {
                    if (this.has_condition("Invisible")) continue
                    this.invisible = this.player ? false : hasCondition
                    this.opacity = hasCondition ? 0.5 : 1
                    continue
                }
                case "Invisible": {
                    this.invisible = this.player ? false : hasCondition
                    this.opacity = hasCondition ? 0.2 : 1
                    continue
                }
                case "Unconscious": {
                    MTScript.evalMacro(`[r: setHasSight(${hasCondition ? 0 : 1}, "${this.id}")]`)
                    break
                }
                default: break
            }

            // State effects
            const conditions_with_state = [
                // Natural
                "Dying", "Dead", "Prone", "Sleep",

                // Spells
                "Blur", "Rage", "Shield", "Hold Person", 
                "Hold Monster", "Bless", "Absorb Elements",
                "Hex", "Hunter's Mark"
            ]
            if (conditions_with_state.includes(condition)) this.set_state(condition, hasCondition)

            // Light effects
            const conditions_with_light = ["Light", "Torch", "Hooded Lantern"]
            if (conditions_with_light.includes(condition)) this.set_light(condition, hasCondition)

            // Concentration && Spellcasting
            if (this.has_conditions(["Incapacitated", "Dead"], "any")) {
                this.remove_condition("Concentration")
                this.remove_condition("Spellcasting")
            }

            // Terrain Modifier
            MTScript.evalMacro(`
                [h: setTerrainModifier('{"terrainModifier":1.5,"terrainModifierOperation":"MULTIPLY","terrainModifiersIgnored":["NONE"]}', "${this.id}")]
            `)
        }

        } catch (error) { console.log(error) }
    }

    turn_start() {
        {// Turn start refreshes
            this.update_state()
            this.maintain_stealth(true)
            this.passive_search()

            // Grappled
            if (this.has_condition("Grappled")) {
                const source = instance(this.get_condition("Grappled").source)

                // Remove grapple if distance is higher than melee
                if (calculate_distance(this, source) > 1) {
                    this.remove_condition("Grappled")

                    // Remove grappling condition from source, if the condition points to THIS
                    if (source.get_condition("Grappling").target == this.id) source.remove_condition("Grappling")
                }
            }
        }

        // Max for Combat Resources
        let attacks = 1, actions = 1, bonus_actions = 1, reactions = 1, movement = this.speed; {
            // Attacks
            if (this.has_feature("Three Extra Attacks")) attacks = 4
            else if (this.has_feature("Two Extra Attacks")) attacks = 3
            else if (this.has_feature("Extra Attack")) attacks = 2

            // Actions
            if (this.has_condition("Haste") && !this.has_condition("Slow")) actions = 2

            // Movement
            if (this.has_condition("Grappling")) movement = Math.floor(movement * 0.5)
        }

        // If Incapacitated
        if (this.has_conditions(["Incapacitated", "Unconscious"], "any")) {
            actions = 0, bonus_actions = 0, reactions = 0
        }
        if (this.has_conditions(["Paralyzed", "Unconscious"], "any")) {
            movement = 0
        }

        // Set resource maxes on character
        const resourceMapping = {
            "Attack Action": attacks, "Action": actions, "Bonus Action": bonus_actions, 
            "Reaction": reactions, "Movement": movement,
        }
        for (const key in resourceMapping) this.set_resource_max(key, resourceMapping[key])

        // Fill resources that recover on "turn start"
        for (const name in this.#resources) {
            const resource = this.#resources[name]
            if (["turn start"].includes(resource.restored_on)) {
                this.set_resource_value(name, resource.max)
            }
        }
    }

    turn_end() {
        // Condition saving throws
        for (const name in this.conditions) {
            const condition = this.conditions[name]
            if (condition.saving_throw) {
                const {difficulty_class, score} = condition.saving_throw

                // Save roll
                const save_bonus = this.score_bonus[score.toLowerCase()] + this.roll_bonus()
                const roll_result = roll_20(0)
                const roll_to_save = roll_result.result + save_bonus

                // Result
                if (roll_to_save >= difficulty_class) {
                    console.log(`${this.name_color} made a ${score} save (DC ${difficulty_class}) and succeded (${roll_result.text_color} + ${save_bonus}) ending ${name}.`, "all")
                    this.remove_condition(name)
                }
                else {
                    console.log(`${this.name_color} made a ${score} save (DC ${difficulty_class}) against ${name} and failed (${roll_result.text_color} + ${save_bonus}).`, "all")
                }
            }
        }
    }

    short_rest(hours = 1) {
        // Heal
        const healing = (this.max_health / 4) * hours
        this.receive_healing(healing)

        // Fill resources
        for (const name in this.#resources) {
            const resource = this.#resources[name]
            
            if (["short rest", "turn start"].includes(resource.restored_on)) {
                this.set_resource_value(name, resource.max)
            }
        }

        // Log
        console.log(`${this.name_color} has rested for ${hours} hours.`, "all")
    }

    long_rest() {
        // Heal
        const healing = this.max_health
        this.receive_healing(healing)

        // Remove temp HP
        this.temporary_health = 0

        // Update Spell Slot Maximum
        this.update_spell_slots()

        // Fill resources
        for (const name in this.#resources) {
            const resource = this.#resources[name]

            if (["long rest", "short rest", "turn start"].includes(resource.restored_on)) {
                this.set_resource_value(name, resource.max)
            }
        }

        // Reduce Exhaustion
        if (this.exhaustion) this.exaustion -= 1

        // Log
        console.log(`${this.name_color} has long rested.`, "all")
    }

    //=====================================================================================================
    // Stealth and Perception
    //=====================================================================================================

    get passive_perception () {
        return this.skills.Perception + 10
    }

    static #can_reveal_stealth (revealing_creature, hidden_creature) {
        try {
            // Not instanced
            if (!revealing_creature || !hidden_creature) return false;
            if (!(revealing_creature instanceof Creature) || !(hidden_creature instanceof Creature)) return false;

            // Both are same teams
            if (revealing_creature.attitude == hidden_creature.attitude) return false

            // Creature is not hidden
            if (!hidden_creature.has_condition("Hidden")) return false

            // Incapacitated
            if (revealing_creature.has_condition("Incapacitated")) return false

            // Too far
            const canSee = revealing_creature.target_visibility(hidden_creature) != 0
            const distance = calculate_distance(revealing_creature, hidden_creature) * 5
            if (distance > 60) return false
            else if (!canSee && distance > 15) return false
        }
        catch { return false }
        return true
    }

    static #calculate_perception_modifier (revealing_creature, hidden_creature, entering_stealth=false) {
        let perception_modifier = 0; {
            // Distance Modifiers
            const distance = calculate_distance(revealing_creature, hidden_creature) * 5
            if (distance > 30) perception_modifier -= 5
            else if (distance < 15) perception_modifier += 5
            if (entering_stealth && distance <= 5) perception_modifier += 10

            // Vision Modifiers
            const isInvisible = hidden_creature.has_condition("Invisible")
            const isDay = MTScript.evalMacro(`[r:getMapVision()]`) == "Day"
            let isFacing = false; {
                const facingDirections = revealing_creature.facing.split("-")
                const directionToTarget = calculate_direction(revealing_creature, hidden_creature).split("-")

                for (const direction of facingDirections) {
                    if (directionToTarget.includes(direction)) isFacing = true
                }
            }
            const vision = isFacing && !isInvisible ? revealing_creature.target_visibility(hidden_creature) : 0
            if (vision == 0) perception_modifier -= 5
            else if (vision <= 0.5) perception_modifier -= 2
            if (isDay && vision > 0) perception_modifier += 5
        }
        return perception_modifier
    }
    
    maintain_stealth (new_roll=false) {
        // Stop execution if is not in stealth
        if (!this.has_condition("Hidden")) return

        // Stealth Roll
        let { stealth_roll, roll_text } = this.get_condition("Hidden")
        const entering_stealth = stealth_roll === undefined || roll_text === undefined || new_roll
        if (new_roll || entering_stealth) {
            const armor = database.items.data[this.equipment.body?.name]
            const advantage_weight = armor ? (armor.properties.includes("Stealth Disadvantage") ? -1 : 0) : 0
            const die_roll = roll_20(advantage_weight)

            // New roll and text
            const stealth_bonus = this.skills.Stealth + this.roll_bonus()
            stealth_roll = die_roll.result + stealth_bonus
            roll_text = `${die_roll.text_color} ${stealth_bonus < 0 ? "-" : "+"} ${Math.abs(stealth_bonus)}`

            // Update on character conditions
            this.set_condition("Hidden", -1, {
                stealth_roll, roll_text
            })
            this.save()
        }
        
        // Loop through all tokens
        let roll_was_required, highest_passive_perception = 0
        const hidden_creature = this
        for (const revealing_creature of mapCreatures()) {
            if (!Creature.#can_reveal_stealth(revealing_creature, hidden_creature)) continue

            // Perception modifiers
            const perception_modifier = Creature.#calculate_perception_modifier(revealing_creature, hidden_creature, entering_stealth)

            // Passive Perception VS Stealth Roll
            const passive_perception = revealing_creature.passive_perception
            if (stealth_roll < passive_perception + perception_modifier) {
                hidden_creature.remove_condition("Hidden")
                const text = `${hidden_creature.name_color} attempted to stay hidden (${roll_text}) but was noticed by ${revealing_creature.name_color} (DC ${passive_perception + perception_modifier}).`
                console.log(text, "all")
                return false
            }
            
            roll_was_required = true
            highest_passive_perception = Math.max(highest_passive_perception, passive_perception + perception_modifier)
        }

        // If there were valid creatures to reveal character, and they kept hidden anyway
        if (roll_was_required) {
            const text = `${hidden_creature.name_color} attempted to stay hidden (${roll_text}) and succeeded (DC ${highest_passive_perception}).`
            console.log(text, this.player ? "all" : "gm")
            return true
        } else {
            const text = `${hidden_creature.name_color} has rolled stealth (${roll_text}) and is hidden.`
            console.log(text, this.player ? "all" : "gm")
            return true
        }
    }

    passive_search() {
        const passive_perception = this.passive_perception

        // Loop
        const revealing_creature = this
        for (const hidden_creature of mapCreatures()) {
            if (!Creature.#can_reveal_stealth(revealing_creature, hidden_creature)) continue

            // Perception modifiers
            const perception_modifier = Creature.#calculate_perception_modifier(revealing_creature, hidden_creature, true)

            // Passive Perception VS Stealth Roll
            const {stealth_roll=0, roll_text=""} = hidden_creature.conditions["Hidden"]
            if (stealth_roll < passive_perception + perception_modifier) {
                hidden_creature.remove_condition("Hidden")
                const text = `${hidden_creature.name_color} attempted to stay hidden (${roll_text}) but was noticed by ${revealing_creature.name_color} (DC ${passive_perception + perception_modifier}).`
                console.log(text, "all")
                continue
            }

            const text = `${hidden_creature.name_color} attempted to stay hidden (${roll_text}) and succeeded (DC ${passive_perception + perception_modifier}).`
            console.log(text, hidden_creature.player ? "all" : "gm")
        }
    }

    active_search() {
        const perception_bonus = this.skills.Perception + this.roll_bonus()
        const die_roll = roll_20()
        const perception_roll = Math.max(die_roll.result + perception_bonus, this.passive_perception)

        // Loop
        const revealing_creature = this
        for (const hidden_creature of mapCreatures()) {
            if (!Creature.#can_reveal_stealth(revealing_creature, hidden_creature)) continue

            // Perception modifiers
            const perception_modifier = Creature.#calculate_perception_modifier(revealing_creature, hidden_creature, true)

            // Passive Perception VS Stealth Roll
            const {stealth_roll=0, roll_text=""} = hidden_creature.conditions["Hidden"]
            if (stealth_roll < perception_roll + perception_modifier) {
                hidden_creature.remove_condition("Hidden")
                const text = `${hidden_creature.name_color} attempted to stay hidden (${roll_text}) but was noticed by ${revealing_creature.name_color} (DC ${perception_roll + perception_modifier}).`
                console.log(text, "all")
                continue
            }

            const text = `${hidden_creature.name_color} attempted to stay hidden (${roll_text}) and succeeded (DC ${perception_roll + perception_modifier}).`
            console.log(text, hidden_creature.player ? "all" : "gm")
        }
    }

    //=====================================================================================================
    // Ability Scores
    //=====================================================================================================

    get ability_scores() { return this.#ability_scores }

    get score_bonus() {
        let bonus = function (score_value) {
            return Math.floor((score_value - 10) / 2);
        }

        return {
            strength: bonus(this.ability_scores.strength),
            dexterity: bonus(this.ability_scores.dexterity),
            constitution: bonus(this.ability_scores.constitution),
            wisdom: bonus(this.ability_scores.wisdom),
            intelligence: bonus(this.ability_scores.intelligence),
            charisma: bonus(this.ability_scores.charisma)
        }
    }

    set_ability_score(ability_score, value) {
        // Validating parameters
        if (isNaN(Number(value))) {return}
        if (!this.ability_scores[ability_score]) {return}

        value = Number(value)
        const min_score_value = 0, max_score_value = 30
        const clamped_value = Math.min(Math.max(value, min_score_value), max_score_value)

        this.#ability_scores[ability_score] = clamped_value

        this.save()

        log(this.#name + " " + ability_score + " set to " + clamped_value + ".")
    }


    //=====================================================================================================
    // Health
    //=====================================================================================================

    get health() { return this.#health }
    
    get max_health() {
        let calculated_max_health = this.ability_scores.constitution
        const type = this.constructor.name

        let level; {
            const crToNumber = s => s.includes('/') ? s.split('/').reduce((a,b)=>a/b) : +s;

            if (type == "Player") level = this.level
            else if (type == "Monster") level = crToNumber(this.challenge_rating) / 0.6
        }

        const size_modifier = {
            "Fine": 0.5,
            "Diminutive": 0.5,
            "Tiny": 0.5, 
            "Small": 0.75,
            "Medium": 1,
            "Large": 1.5, 
            "Huge": 2, 
            "Gargantuan": 2.5,
            "Colossal": 3
        }[this.size]

        // Class or Archetype based increase
        if (type == "Player") {
            for (const player_class in this.classes) {
                const class_base_health = eval(player_class).healthPerLevel || 4
                const adjusted_base_health = class_base_health * size_modifier

                const class_level = this.classes[player_class].level
                calculated_max_health += adjusted_base_health * class_level
            }
        }
        else if (type == "Monster") {
            const arch_base_health = {
                "Default": 5,
                "Mage": 4,
                "Soldier": 6,
                "Brute": 7
            }[this.health_archetype]
            const adjusted_base_health = arch_base_health * size_modifier
            calculated_max_health += adjusted_base_health * level
        }

        /* Feature-based modifiers */; {
            // Dwarven Toughness
            if (this.has_feature("Dwarven Toughness")) {
                calculated_max_health += (1 * level)
            }
        }

        /* Condition-based modifiers */; {
            // Ranger's Companion
            if (this.has_condition("Ranger's Companion")) {
                const condition = this.get_condition("Ranger's Companion")
                const source = instance(condition.source)
                if (source) {
                    const wisdom = Number(source.score_bonus.wisdom) || 0
                    const source_level = Number(source.classes.Ranger.level) || 0
                    calculated_max_health += (source_level * wisdom)
                }
            }
        }

        return Math.floor(calculated_max_health)
    }

    get temporary_health() { return this.#temporary_health }
    
    set temporary_health(value) {
        // Validating parameters
        if (isNaN(Number(value))) { return }
        const clampedValue = Math.max(0, Number(value))
        
        this.#temporary_health = clampedValue;
        
        this.update_state()
        this.save();
    }

    gain_temporary_health(value) {
        // Validating parameters
        if (isNaN(Number(value))) { return }
        
        const oldTempHP = Number(this.temporary_health) || 0
        const newTempHP = Math.max(oldTempHP, Number(value));
        this.temporary_health = newTempHP;
        
        log(this.#name + " gained " + value + " temporary hit points (total: " + (newTempHP - oldTempHP) + ").");
    }

    get size() {return MTScript.evalMacro(`[r:getSize("${this.id}")]`)}
    
    set size(size) {
        const valid_sizes = ["Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan", "Colossal"];
        if (!valid_sizes.includes(size)) return;

        // Store percentage of health
        const health_percentage = this.health / this.max_health;

        // Apply size change in MPTool
        MTScript.evalMacro(`[r:setSize("${size}", "${this.id}")]`);

        const new_max_health = this.max_health;

        // Recalculate health based on percentage
        this.health = Math.floor(new_max_health * health_percentage);
    }

    set health(health) {
        // Validating parameters
        if (isNaN(Number(health))) { return }
        const newHealth = Math.max(Math.min(health, this.max_health), 0)

        // Store old health for comparison
        const oldHealth = this.#health;

        // Prevent infinite loop - don't process if health hasn't actually changed
        if (oldHealth === newHealth) return;

        this.#health = newHealth;
        this.update_state()
        this.save();

        // Handle transitions to/from 0 HP
        if (newHealth <= 0 && oldHealth > 0) {
            this.#handle_zero_hp();
        }
        else if (newHealth > 0 && oldHealth <= 0) {
            // Remove death/dying conditions if health is restored from 0
            if (this.has_condition("Dead")) this.remove_condition("Dead")
            if (this.has_condition("Dying")) this.remove_condition("Dying")
        }
    }

    #handle_zero_hp() {
        const isPlayer = this.constructor.name === "Player"

        // Set conditions
        if (isPlayer && (this.exhaustion || 0) < 10) {
            if (this.has_condition("Dead")) this.remove_condition("Dead")
            const duration = this.has_condition("Dying") ? this.get_condition("Dying").duration - 5 : 10

            // Set dying condition
            this.set_condition("Dying", duration)
            console.log(`${this.name_color} is dying in ${duration} round${duration>1 ? "s" : ""}.`, "all")
        }
        else {
            if (this.has_condition("Dying")) this.remove_condition("Dying")
            this.set_condition("Dead", -1, {time_of_death: Time.current})
            if (Initiative && Initiative.remove_creature) {
                Initiative.remove_creature(this.id)
            }
        }
    }

    receive_damage(value, type) {
        // Validating parameters
        if (value <= 0) return
        if (!this.resistances[type]) return

        // Calculate damage based on resistance
        const resistance = this.resistances[type];
        let damage = 0; {
            switch (resistance.type) {
                case "immunity":
                    // If Immunity from Stoneskin
                    if (this.has_condition("Stoneskin") && ["Slashing", "Piercing", "Bludgeoning"].includes(type)) {
                        const condition = this.get_condition("Stoneskin")
                        
                        if (condition.charges > 1) this.set_condition("Stoneskin", condition.duration, {...condition, charges: condition.charges - 1})
                        else this.remove_condition("Stoneskin")
                        console.log(`${this.name_color} used a Stoneskin charge.`, "all")
                    }
                    return 0
                case "heals":
                    this.receive_healing(value)
                    return 0
                case "vulnerability":
                    damage = value * 2
                    break
                default:
                    damage = Math.max(value - resistance.reduction, 0);
                    break;
            }
        }

        // Apply damage to temporary health first, then to actual health
        let damageToHealth = damage;
        
        if (this.temporary_health > 0) {
            const tempHPLost = Math.min(damage, this.temporary_health);
            this.temporary_health -= tempHPLost;
            damageToHealth = damage - tempHPLost;
            
            console.log(`${this.name_color} lost ${tempHPLost} temporary hit points.`, "debug");
            
            // If all temporary HP is gone, log it
            if (this.temporary_health === 0) {
                console.log(`${this.name_color} has no more temporary hit points.`, "debug");
            }
        }

        // Check if target is already at 0 HP and has Dying condition
        const isDying = this.health <= 0 && this.has_condition("Dying");
        
        // Apply remaining damage to actual health
        if (damageToHealth > 0) {
            const newHealth = this.health - damageToHealth

            // Apply exhaustion if 0 hp
            const isPlayer = this.player || this.constructor.name === "Player" || 
                            (this.token && JSON.parse(this.token.getProperty("class") || "[]").includes("Player"));
            if (newHealth <= 0 && this.health > 0 && isPlayer) {
                this.exhaustion += 1
            }

            // Apply damage
            this.health = newHealth;
        }

        // If target is already dying and takes damage, reduce dying duration
        if (isDying && damageToHealth > 0) {
            const dyingCondition = this.get_condition("Dying");
            if (dyingCondition) {
                const newDuration = dyingCondition.duration - 5;
                
                if (newDuration <= 0) {
                    // Dying condition ends, creature dies
                    this.remove_condition("Dying");
                    this.set_condition("Dead", -1, {time_of_death: Time.current});
                    if (Initiative && Initiative.remove_creature) {
                        Initiative.remove_creature(this.id);
                    }
                    console.log(`${this.name_color} has succumbed to their injuries and died.`, "all");
                } else {
                    // Update dying condition with reduced duration
                    this.set_condition("Dying", newDuration, {...dyingCondition, duration: newDuration});
                    console.log(`${this.name_color} is closer to death. Dying condition reduced to ${newDuration} rounds.`, "all");
                }
            }
        }

        // Lose Concentration (only check if actual health was damaged)
        if (damageToHealth > 0 && this.has_condition("Concentration")) {
            // Concentration advantage
            let advantage_weight = 0
            if (this.has_feature("Invocation: Eldritch Mind")) advantage_weight += 1

            // Roll d20
            const roll_result = roll_20(advantage_weight)
            const save_bonus = this.saving_throws.constitution + this.roll_bonus()
            const roll_to_save = roll_result.result + save_bonus

            // Difficulty Class
            const difficulty_class = Math.max(Math.floor(damageToHealth / 2), 10) // equals damage halved or 10, whichever is highest

            if (roll_to_save >= difficulty_class) {
                console.log(`${this.name_color} made a Constitution save (DC ${difficulty_class}) to maintain concentration and succeeded (${roll_result.text_color} + ${save_bonus}).`, "all")
            } else {
                console.log(`${this.name_color} made a Constitution save (DC ${difficulty_class}) to maintain concentration and failed (${roll_result.text_color} + ${save_bonus}).`, "all")
                this.remove_condition("Concentration")
            }
        }

        // Lose Spellcasting (only check if actual health was damaged)
        if (damageToHealth > 0 && this.has_condition("Spellcasting")) {
            // Concentration advantage
            let advantage_weight = 0
            if (this.has_feature("Invocation: Eldritch Mind")) advantage_weight += 1

            // Roll d20
            const roll_result = roll_20(advantage_weight)
            const save_bonus = this.saving_throws.constitution + this.roll_bonus()
            const roll_to_save = roll_result.result + save_bonus

            // Difficulty Class
            const difficulty_class = Math.max(Math.floor(damageToHealth / 2), 10) // equals damage halved or 10, whichever is highest

            if (roll_to_save >= difficulty_class) {
                console.log(`${this.name_color} made a Constitution save (DC ${difficulty_class}) to maintain their spellcasting and succeeded (${roll_result.text_color} + ${save_bonus}).`, "all")
            } else {
                console.log(`${this.name_color} made a Constitution save (DC ${difficulty_class}) to maintain their spellcasting and failed (${roll_result.text_color} + ${save_bonus}).`, "all")
                this.remove_condition("Spellcasting")
            }
        }

        // Log
        const totalDamage = damage;
        const tempDamage = damage - damageToHealth;
        const healthDamage = damageToHealth;
        
        let logMessage = `${this.name} received ${totalDamage} ${type} damage`;
        if (tempDamage > 0) {
            logMessage += ` (${tempDamage} to temporary HP, ${healthDamage} to HP)`;
        }
        console.log(logMessage, "debug");
        
        return totalDamage;
    }

    receive_healing(value) {
        if (this.has_condition("Dead")) {
            console.log(`${this.name_color} can't be healed.`, "all")
            return
        }
        this.health += value

        log(this.#name + " received " + value + " points of healing.");
    }

    //=====================================================================================================
    // Resistances
    //=====================================================================================================

    get resistances() {
        let resistances = {
            "Normal": {type: "resistance", reduction: 0},
            "Nonsilver": {type: "resistance", reduction: 0},
            "Slashing": {type: "resistance", reduction: 0},
            "Piercing": {type: "resistance", reduction: 0},
            "Bludgeoning": {type: "resistance", reduction: 0},
            "Fire": {type: "resistance", reduction: 0},
            "Cold": {type: "resistance", reduction: 0},
            "Lightning": {type: "resistance", reduction: 0},
            "Thunder": {type: "resistance", reduction: 0},
            "Acid": {type: "resistance", reduction: 0},
            "Poison": {type: "resistance", reduction: 0},
            "Psychic": {type: "resistance", reduction: 0},
            "Radiant": {type: "resistance", reduction: 0},
            "Necrotic": {type: "resistance", reduction: 0},
            "Force": {type: "resistance", reduction: 0},
        };

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

        // Apply resistances from conditions
        for (const name in this.conditions) {
            const condition = this.conditions[name];
            if (condition.resistances) {
                applyResistancesOfObject(condition.resistances);
            }
        }

        // Apply resistances from equipment
        for (const slot in this.equipment) {
            const itemData = this.equipment[slot];
            if (itemData) {
                const item = database.items.data[itemData.name];
                if (item && item.resistances) {
                    applyResistancesOfObject(item.resistances);
                }
            }
        }

        // Others
        {
            // Dwarven Resilience
            if (this.has_feature("Dwarven Resilience")) applyResistancesOfObject({
                Poison: {type: "resistance", reduction: 10}
            })

            // Heavy Armor Expertise
            if (this.get_proficiency_level("Heavy Armor") >= 1 && this.armor_type == "Heavy") applyResistancesOfObject({
                Slashing: {type: "resistance", reduction: 3},
                Bludgeoning: {type: "resistance", reduction: 3},
                Piercing: {type: "resistance", reduction: 3},
            })
        }
        
        return resistances;
    }

    //=====================================================================================================
    // Armor Class and Initiative
    //=====================================================================================================

    get armor_type() {
        const body_slot = this.equipment.body
        let armor_type = "None"
        if (body_slot) {
            const item = database.get_item(body_slot.name);
            if (item) {
                // Match armor weight by its properties
                const type = ["Heavy", "Medium", "Light"].find(prop => 
                    item.properties?.includes(prop)
                );
                armor_type = type || armor_type;
            }
        }
        return armor_type
    }

    get initiative_mod() {
        let initiative_mod = 0;
    
        // Add armor mod
        switch (this.armor_type) {
            case "Heavy":
                initiative_mod += 2;
                break;
            case "Medium":
                initiative_mod += 1;
                break;
            case "Light":
                initiative_mod += 0;
                break;
            default:
                break;
        }

        // Add shield mod
        const slot = this.equipment["primary off hand"]
        if (slot) {
            const item = database.items.data[slot.name]
            if (item.subtype == "shield") initiative_mod += 1
        }
    
        return initiative_mod;
    }

    get armor_class_detail() {
        const base = 10

        // Dexterity Modifier
        let dex_mod = this.score_bonus.dexterity; {
            switch (this.armor_type) {
                case "Heavy": 
                    dex_mod = 0
                    break

                case "Medium":
                    const max_bonus = this.get_proficiency_level("Medium Armor") >= 1 ? 3 : 2
                    dex_mod = Math.max(-max_bonus, Math.min(this.score_bonus.dexterity, max_bonus));
                    break
            }
        }

        // Armor
        let armor = 0; {
            const item_base_ac = this.equipment.body ? database.get_item(this.equipment.body.name).base_armor_class || 0 : 0
            armor = item_base_ac - 10
        }
        
        // Equipment Bonus
        let equipment_bonus = 0; {
            const equipment = this.#equipment;
            for (const slot in equipment) {
                const itemData = equipment[slot];
                if (itemData && !slot.includes("secondary")) {
                    const item = database.items.data[itemData.name]; // Access the item name first
                    if (item) {
                        const bonus_ac = item.bonus_armor_class || 0;
                        equipment_bonus += Number(bonus_ac);
                    }
                }
            }
        }

        // Condition Bonus
        let condition_bonus = 0; {
            for (const name in this.conditions) {
                const condition = this.conditions[name]
                if (condition.bonus_armor_class) condition_bonus += condition.bonus_armor_class
            }
        }

        // Unnarmored Bonus
        let unnarmored_bonus = 0; {
            // Barbarian Toughness
            if (this.has_feature("Barbarian Toughness")) {
                unnarmored_bonus = Math.max(unnarmored_bonus, this.score_bonus.constitution)
            }

            // Mage Armor
            if (this.has_condition("Mage Armor")) {
                unnarmored_bonus = Math.max(unnarmored_bonus, 3)
            }
        }

        // Total armor class
        let total = 0; {
            if ("None" == this.armor_type) {
                armor = 0
                total = base + dex_mod + unnarmored_bonus + equipment_bonus + condition_bonus
            }
            else {
                unnarmored_bonus = 0
                total = base + dex_mod + armor + equipment_bonus + condition_bonus
            }
        }

        return {total, base, armor, unnarmored_bonus, dex_mod, equipment_bonus, condition_bonus}
    }

    get armor_class() {
        return this.armor_class_detail.total
    }

    //=====================================================================================================
    // Speed
    //=====================================================================================================

    get base_speed() {
        return this.#speed.walk
    }

    get speed() {
        // Modifiers
        const speed_modifiers = {
            features: {
                "Barbaric Movement": { type: "add", value: 10 },
                "Monk Movement": { type: "add", value: 10 },
                "Roving":  { type:"add", value: 5 },
                "Fleet of Foot":  { type:"add", value: 5 },
                "Bulky":  { type:"add", value: -5 },
            },
            conditions: {
                "Haste": { type: "multiply", value: 2 },
                "Slow": { type: "multiply", value: 0.5 },
                "Ray of Frost": {type: "multiply", value: 0.5},
                "Paralyzed": {type: "multiply", value: 0},
                "Unconscious": {type: "multiply", value: 0},
                "Petrified": {type: "multiply", value: 0},
                "Grappled": {type: "multiply", value: 0},
                "Restrained": {type: "multiply", value: 0},
                "Stunned": {type: "multiply", value: 0},
            }
        }

        // Calculate Speed
        let baseSpeed; {
            // Default Value
            baseSpeed = this.#speed.walk

            // Feature-based modifiers
            for (const [feature, modifier] of Object.entries(speed_modifiers.features)) {
                if (this.has_feature(feature)) {
                    if (modifier.type === "add") { baseSpeed += modifier.value; } 
                    else if (modifier.type === "multiply") { baseSpeed *= modifier.value; }
                }
            }

            // Condition-based modifiers
            for (const [condition, modifier] of Object.entries(speed_modifiers.conditions)) {
                if (this.has_condition(condition)) {
                    if (modifier.type === "add") { baseSpeed += modifier.value; } 
                    else if (modifier.type === "multiply") { baseSpeed *= modifier.value; }
                }
            }

            // Rounding
            Math.floor(baseSpeed)
        }
    
        return baseSpeed
    }

    set speed(speed) {
        this.#speed.walk = speed
        this.save()
    }
    

    //=====================================================================================================
    // Resources
    //=====================================================================================================

    get resources() {return this.#resources}

    get_resource_value(resource) {
        return this.#resources?.[resource]?.value
    }

    use_resource(resource) {
        if (!this.#resources[resource]) return

        this.set_resource_value(resource, this.#resources[resource].value - 1)
    }

    set_new_resource(resource, max, restored_on) {
        this.#resources[resource] = {
            value: 0,
            max: max, 
            restored_on: restored_on,
        }

        this.save()
    }

    set_resource_max(resource, max) {
        if (!this.#resources[resource]) return

        this.#resources[resource].max = max

        this.save()
    }

    set_resource_value(resource, value) {
        if (!this.#resources[resource]) return
        
        const resourcesThatCanGoOverMax = ["Sorcery Point"]
        const ignoreMax = resourcesThatCanGoOverMax.includes(resource) || resource.includes("Spell Slot")

        // Set
        if (!ignoreMax) {
            // Clamp value
            const resource_data = this.#resources[resource]
            const clamped_value = Math.min(resource_data.max, Math.max(0, value))
            this.#resources[resource].value = clamped_value
            
        }
        else this.#resources[resource].value = value

        this.save()
    }

    //=====================================================================================================
    // Features
    //=====================================================================================================

    get features() {return this.#features}

    add_feature(name) {
        this.#features.push(name);

        this.save();
        log(this.#name + " received the feature " + name + ".");
    }

    remove_feature(name) {
        this.#features = this.#features.filter(value => value != name);

        this.save();
        log(this.#name + " lost the " + type + " feature " + name + ".");
    }

    has_feature(name) {
        return this.features.includes(name);
    }

    reset_features() {
        this.#features = []
        this.save()
    }


    //=====================================================================================================
    // Proficiencies
    //=====================================================================================================

    get proficiencies () {return this.#proficiencies}

    set_proficiency(name, level, highest=false) {
        if (isNaN(Number(level))) {
            log("Invalid number when setting proficiency: "+name+" as level: "+level)
            return 
        }

        if(highest && this.proficiencies[name]) {
            this.proficiencies[name] = Math.max(this.get_proficiency_level(name), level)
        }

        this.proficiencies[name] = String(level)
        log(this.#name + " received the proficiency " + name + ".");
        
        this.save()
    }

    remove_proficiency(name) {
        if (this.proficiencies[name]) {
            delete this.proficiencies[name]
        }

        this.save()
    }

    get_proficiency_level(name) {
        if (this.proficiencies[name] || this.proficiencies[name] == 0) {
            return this.proficiencies[name]
        }
        return -1
    }

    reset_proficiencies() {
        this.#proficiencies = {}
        this.save()
    }

    //=====================================================================================================
    // Spells
    //=====================================================================================================

    get spells() { return this.#spells }

    get spellcasting_level() { return this.#spellcasting_level }

    set spellcasting_level(level) {
        this.#spellcasting_level = level
        this.save()
    }

    reset_spells() {
        this.#spells = {}
        this.save()
    }

    update_spell_slots() {
        // Find spellcasting slots on table based on spellcasting level
        const spellcasting_table = [
            {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 0
            {1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 1
            {1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 2
            {1: 4, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 3
            {1: 4, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 4
            {1: 4, 2: 3, 3: 2, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 5
            {1: 4, 2: 3, 3: 3, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 6
            {1: 4, 2: 3, 3: 3, 4: 1, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 7
            {1: 4, 2: 3, 3: 3, 4: 2, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 8
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 9
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 0, 7: 0, 8: 0, 9: 0},   // Level 10
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 0, 8: 0, 9: 0},   // Level 11
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 0, 8: 0, 9: 0},   // Level 12
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 0, 9: 0},   // Level 13
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 0, 9: 0},   // Level 14
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 0},   // Level 15
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 0},   // Level 16
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1},   // Level 17
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1},   // Level 18
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1},   // Level 19
            {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1}    // Level 20
        ]
        const spellcasting_level_slots = spellcasting_table[(this.spellcasting_level_no_warlock ?? this.spellcasting_level)]

        // Update spellcasting slot resources
        for (const slot in spellcasting_level_slots) {
            const max = spellcasting_level_slots[slot]
            const postfix = ["st", "nd", "rd"].length >= slot ? ["st", "nd", "rd"][slot - 1] : "th"
            const resource = `${slot}${postfix} Level Spell Slot`

            // Update max value if exists, or creates new resource
            if (this.#resources[resource]) {
                if (max > 0) this.set_resource_max(resource, max)
                else delete this.#resources[resource]
            } else {
                if (max > 0) this.set_new_resource(resource, max, "long rest")
            }
        }

        this.save()
    }

    learn_spell(player_class, spell_name) {
        // Verify if spell exists
        if (!database.get_spell(spell_name)) { return }

        // Create spellcasting info if needed
        if (!this.#spells[player_class]) {
            this.#spells[player_class] = {}
        }

        // Create spellcasting known list if needed
        if (!this.#spells[player_class].known) {
            this.#spells[player_class].known = []
        }

        // Adding spell to known list
        this.#spells[player_class].known.push(spell_name)

        console.log(this.name + " has learned the " + spell_name + " spell.", "debug")
        this.save()
    }

    unlearn_spell(player_class, spell_name) {
        // Validates if spell exists, and if character has it
        if (!database.get_spell(spell_name)) { return }
        if (!this.#spells[player_class]) { return }
        if (!this.#spells[player_class].known) { return }
        if (!this.#spells[player_class.known.includes(spell_name)]) { return }

        // Removes spell from known list
        this.#spells[player_class].known = this.#spells[player_class].known.filter(
            item => item != spell_name
        )
    }

    memorize_spell(player_class, spell_name) {
        // Verify if spell exists
        if (!database.get_spell(spell_name)) { return }

        // Create spellcasting info if needed
        if (!this.#spells[player_class]) {
            this.#spells[player_class] = {}
        }

        // Create spellcasting memorized list if needed
        if (!this.#spells[player_class].memorized) {
            this.#spells[player_class].memorized = []
        }

        // Verify if character can memorize spell in that class
        const spellcasting = eval(player_class).spellcasting
        if (spellcasting) {
            const spellcasting_modifier = this.score_bonus[spellcasting.ability]
            const memorization_maximum = Math.max(0, spellcasting_modifier) + (this.classes?.[player_class]?.level || this.spellcasting_level || 0)
            const currently_memorized_count = this.#spells[player_class].memorized.length
            if (currently_memorized_count >= memorization_maximum) { return }
        }
        else return

        // Adding spell to memorized list
        this.#spells[player_class].memorized.push(spell_name)

        console.log(this.name + "has memorized the " + spell_name + " spell.", "debug")
        this.save()
        return true
    }

    set_always_prepared_spell(player_class, spell_name) {
        // Verify if spell exists
        if (!database.get_spell(spell_name)) { return }

        // Create spellcasting info if needed
        if (!this.#spells[player_class]) {
            this.#spells[player_class] = {}
        }

        // Create spellcasting always prepared list if needed
        if (!this.#spells[player_class].always_prepared) {
            this.#spells[player_class].always_prepared = []
        }

        // Adding spell to always prepared list
        this.#spells[player_class].always_prepared.push(spell_name)

        console.log(this.name + "has the " + spell_name + " spell always prepared.", "debug")
        this.save()
    }

    set_innate_spell(player_class, spell_name) {
        // Verify if spell exists
        if (!database.get_spell(spell_name)) { return }

        // Create spellcasting info if needed
        if (!this.#spells[player_class]) {
            this.#spells[player_class] = {}
        }

        // Create spellcasting always prepared list if needed
        if (!this.#spells[player_class].innate) {
            this.#spells[player_class].innate = []
        }

        // Adding spell to always prepared list
        this.#spells[player_class].innate.push(spell_name)

        console.log(this.name + "has " + spell_name + " as an innate spell.", "debug")
        this.save()
    }

    forget_spell(player_class, spell_name) {
        // Validates if spell exists, and if has it memorized
        if (!database.get_spell(spell_name)) { return }
        if (!this.#spells[player_class]) { return }
        
        // Remove non existant spells from memorized list
        this.#spells[player_class].memorized = this.#spells[player_class].memorized.filter(
            spell => Object.keys(database.spells.data).includes(spell)
        )

        // Remove spell from memorized list
        if (this.#spells[player_class].memorized) {
            if (this.#spells[player_class].memorized.includes(spell_name)) {
                this.#spells[player_class].memorized = this.#spells[player_class].memorized.filter(
                    item => item != spell_name
                )
            }
        }

        // Remove spell from always prepared list
        if (this.#spells[player_class].always_prepared) {
            if (this.#spells[player_class].always_prepared.includes(spell_name)) {
                this.#spells[player_class].always_prepared = this.#spells[player_class].always_prepared.filter(
                    item => item != spell_name
                )
            }
        }

        console.log(this.name + "has unmemorized the " + spell_name + " spell.", "debug")
        this.save()
    }

    //=====================================================================================================
    // Saving Throws
    //=====================================================================================================

    get saving_throws() {
        let saving_throws = this.score_bonus

        // Capitalize String
        function capitalize(str) {
            if (str.length === 0) return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        // Apply Proficiency Bonus
        for (const ability in saving_throws) {
            saving_throws[ability] += (this.get_proficiency_level( capitalize(ability) + " Saves") + 1) * 2
        }
        
        return saving_throws
    }
    
    
    //=====================================================================================================
    // Skills
    //=====================================================================================================

    get skills() {
        let skills = {
            // Strength-based skills
            "Athletics": this.score_bonus.strength,
            "Intimidation": Math.max(this.score_bonus.charisma, this.score_bonus.strength),
        
            // Dexterity-based skills
            "Acrobatics": this.score_bonus.dexterity,
            "Sleight of Hand": this.score_bonus.dexterity,
            "Stealth": this.score_bonus.dexterity,
        
            // Wisdom-based skills
            "Animal Handling": this.score_bonus.wisdom,
            "Insight": this.score_bonus.wisdom,
            "Medicine": this.score_bonus.wisdom,
            "Perception": this.score_bonus.wisdom,
            "Survival": this.score_bonus.wisdom,
        
            // Intelligence-based skills
            "Arcana": this.score_bonus.intelligence,
            "History": this.score_bonus.intelligence,
            "Investigation": this.score_bonus.intelligence,
            "Nature": this.score_bonus.intelligence,
            "Religion": this.score_bonus.intelligence,
        
            // Charisma-based skills
            "Deception": this.score_bonus.charisma,
            "Performance": this.score_bonus.charisma,
            "Persuasion": this.score_bonus.charisma
        };

        // Apply Proficiency Bonus
        for (const skill in skills) {
            skills[skill] += (Number(this.get_proficiency_level(skill)) + 1) * 2
        }
        
        return skills
    }

    //=====================================================================================================
    // Conditions
    //=====================================================================================================

    get conditions() {
        const conditions = {...this.#conditions}
        return conditions
    }

    get equipment_conditions () {
        const conditions = {}
        // Check equipment
        for (const position in this.equipment) {
            if (position.includes("secondary")) continue

            const slot = this.equipment[position]
            if (!slot) continue

            const item = database.items.data[slot.name] || {}
            if (!item.conditions) continue
            
            for (const name of item.conditions) {
                conditions[name] = {duration: -1, end_time: -1}
            }
        }
        return conditions
    }

    get_condition(condition) { return this.conditions[condition] }

    set_condition(condition, duration, object = {}) {
        duration = duration !== undefined ? Number(duration) : database.conditions.data[condition].duration || 0;

        // If no duration remove it
        if (duration === 0) {
            this.remove_condition(condition);
            return;
        }

        // Calculate end time based on duration
        let end_time = null;
        if (duration === -1) {
            // Infinite duration (permanent conditions)
            end_time = -1;
        } else if (duration >= 1) {
            // Convert rounds to seconds and add to current time
            end_time = Time.current + TimeUnit.rounds(duration);
        }

        // If duration is valid, set the condition
        if (end_time !== null) {
            this.#conditions[condition] = {
                ...object,
                end_time: end_time,
                // Keep duration for display/logging purposes
                duration: duration,
            };

            // Log
            const msg = duration === -1
                ? `${this.#name} received the ${condition} condition.`
                : `${this.#name} received the ${condition} condition for ${duration} rounds.`;

            console.log(msg, "debug");
        }

        this.update_state();
        this.save();
    }

    remove_condition(condition) {
        if (!this.has_condition(condition)) return;

        // Special cases
        switch (condition) {
            case "Concentration": {
                const concentration = this.get_condition("Concentration");
                if (concentration?.targets && concentration?.condition) {
                    for (const id of concentration.targets) {
                        const target = instance(id);
                        if (target) {
                            target.remove_condition(concentration.condition);
                        }
                    }
                    console.log(`${this.name_color} has lost concentration on ${concentration.condition}.`, "all");
                }
                break
            }
            case "Spellcasting": {
                const spellcasting = this.get_condition("Spellcasting")
                const {spell} = spellcasting
                if (Initiative?.creatures?.[this.id]?.status == "Suspended") {
                    const current_initiative = Initiative.creatures[Initiative.current_creature].initiative
                    Initiative.creatures = {...Initiative.creatures,
                        [this.id]: {...Initiative.creatures[this.id],
                            initiative: current_initiative + 1
                        }
                    }
                    console.log(`${this.name_color} has lost the ${spell.name} spell they were casting.`, "all");
                }
                break
            }
            case "Dying": {
                if (this.health == 0) {
                    this.exhaustion = 10
                    this.health = 0
                }
            }
            default: break
        }

        delete this.#conditions[condition];
        console.log(`${this.#name} lost the condition ${condition}.`, "debug");

        this.update_state();
        this.save();
    }

    check_expired_conditions() {
        const current_time = Time.current;
        const expired_conditions = [];
        
        for (const [name, condition] of Object.entries(this.conditions)) {
            // Handle legacy conditions without end_time
            if (condition.end_time === undefined) {
                this.#migrate_legacy_condition(name, condition);
                // Get the updated condition after migration
                const migrated_condition = this.get_condition(name);
                if (migrated_condition && migrated_condition.end_time !== -1 && migrated_condition.end_time <= current_time) {
                    expired_conditions.push(name);
                }
                continue;
            }
            
            if (condition.end_time !== -1 && condition.end_time <= current_time) {
                expired_conditions.push(name);
            }
        }
        
        // Remove expired conditions
        for (const condition_name of expired_conditions) {
            this.remove_condition(condition_name);
        }
        
        return expired_conditions.length > 0;
    }

    get_remaining_duration(condition) {
        const cond = this.get_condition(condition);
        if (!cond || cond.end_time === -1) return -1; // Infinite duration
        
        // Handle legacy conditions without end_time
        if (cond.end_time === undefined) {
            this.#migrate_legacy_condition(condition, cond);
            return cond.duration; // Return original duration for legacy conditions
        }
        
        const remaining_seconds = Math.max(0, cond.end_time - Time.current);
        return Math.round(TimeUnit.toRounds(remaining_seconds));
    }

    #migrate_legacy_condition(condition_name, condition) {
        // Calculate end_time based on current duration and global time
        if (condition.duration === -1) {
            condition.end_time = -1; // Infinite duration
        } else if (condition.duration > 0) {
            // Convert rounds to seconds and add to current time
            condition.end_time = Time.current + TimeUnit.rounds(condition.duration);
        } else {
            // Duration is 0 or invalid, remove the condition
            this.remove_condition(condition_name);
            return;
        }
        
        // Save the migrated condition
        this.#conditions[condition_name] = condition;
        this.save();
        
        console.log(`Migrated legacy condition "${condition_name}" to new time system.`, "debug");
    }

    get_all_remaining_durations() {
        const durations = {};
        const current_time = Time.current;
        
        for (const [name, condition] of Object.entries(this.conditions)) {
            // Handle legacy conditions without end_time
            if (condition.end_time === undefined) {
                this.#migrate_legacy_condition(name, condition);
                // After migration, use the migrated condition
                durations[name] = condition.duration; // Return original duration for legacy conditions
                continue;
            }
            
            if (name == "Exhaustion") {
                durations[name] = this.exhaustion || -1
            }
            else if (condition.end_time === -1) {
                durations[name] = -1; // Infinite duration
            } else {
                const remaining_seconds = Math.max(0, condition.end_time - current_time);
                durations[name] = Math.round(TimeUnit.toRounds(remaining_seconds));
            }
        }
        
        return durations;
    }

    has_condition(name, visited = new Set()) {
        // Prevent infinite loops in case of circular equivalence
        if (visited.has(name)) return false;
        visited.add(name);

        // Direct condition match
        if (name in this.conditions) return true;
        if (name in this.equipment_conditions) return true;

        // Equivalent conditions map
        const equivalent_conditions = {
            "Blinded": ["Blindness"],
            "Incapacitated": ["Paralyzed", "Petrified", "Stunned", "Unconscious"],
            "Paralyzed": ["Hold Person", "Hold Monster"],
            "Unconscious": ["Sleep", "Dead", "Dying"],
            "Invisible": ["Invisibility", "Greater Invisibility"]
        };

        // Check all equivalent conditions recursively
        const equivalents = equivalent_conditions[name] || [];
        for (const equivalent of equivalents) {
            if (this.has_condition(equivalent, visited)) return true;
        }

        return false;
    }

    has_conditions(list, match = "all") {
        switch(match) {
            // Any match
            case "any": {
                for (const feature of list) {
                    if (this.has_condition(feature)) return true
                }
            }

            // All match
            case "all": {
                for (const feature of list) {
                    if (!this.has_condition(feature)) return false
                }
                return true
            }
        }
    }

    //=====================================================================================================
    // Inventory & Equipment
    //=====================================================================================================

    get carry_weight () {
        const strength_score = Number(this.ability_scores.strength)
        const max = strength_score * 10
        const encumberance = strength_score * 7
        let current = 0

        // Increase current
        for (const slot of this.#inventory) {
            if (!slot) continue
            const item = database.items.data[slot.name] || {}
            current += (item.weight || 0) * slot.amount
        }
        for (const key in this.#equipment) {
            const slot = this.#equipment[key]
            if (!slot) continue
            const item = database.items.data[slot.name] || {}
            current += (item.weight || 0) * slot.amount
        }

        return { max, encumberance, current }
    }

    get inventory () {
        this.update_inventory_slots()
        return this.#inventory
    }

    get equipment() {
        return this.#equipment
    }

    switch_weapon_sets() {
        // Save current
        const current_main_hand = this.#equipment["primary main hand"]
        const current_off_hand = this.#equipment["primary off hand"]

        // Update main slots
        this.#equipment["primary main hand"] = this.#equipment["secondary main hand"]
        this.#equipment["primary off hand"] = this.#equipment["secondary off hand"]
    
        // Update secondary slots
        this.#equipment["secondary main hand"] = current_main_hand
        this.#equipment["secondary off hand"] = current_off_hand

        this.save()
        this.update_state()
    }

    update_inventory_slots() {
        const max_inventory_size = 65;
        const current_size = this.#inventory.length;

        if (current_size < max_inventory_size) {
            this.#inventory.push(...Array(max_inventory_size - current_size).fill(null));
        } else if (current_size > max_inventory_size) {
            this.#inventory.splice(max_inventory_size, current_size - max_inventory_size);
        }

        this.save();
    }

    receive_item(name, amount = 1) {
        this.update_inventory_slots();

        const item = database.get_item(name);
        const max_stack = item.stackable ? item.max_stack || 20 : 1;

        // First loop: Check existing stacks
        for (let i = 0; i < this.#inventory.length && amount > 0; i++) {
            const slot = this.#inventory[i];
            if (slot && slot.name === name && slot.amount < max_stack) {
                const available_space = max_stack - slot.amount;
                const added_amount = Math.min(amount, available_space);
                slot.amount += added_amount;
                amount -= added_amount;
            }
        }

        // Second loop: Add to the first empty slot
        for (let i = 0; i < this.#inventory.length && amount > 0; i++) {
            if (this.#inventory[i] === null) {
                const stack_amount = item.stackable ? Math.min(amount, max_stack) : 1;
                this.#inventory[i] = { name, amount: stack_amount };
                amount -= stack_amount;
            }
        }

        if (amount > 0) {
            console.log(amount + " items were not added because the inventory is full.", "gm");
        }

        this.save();
    }
    
    drop_item(index, amount) {
        // Helper functions
        const DEFAULT_ITEM = { name: null, amount: 0 };
        const getSlot = (container, index) => 
            (container === "inventory" ? this.#inventory[index] : this.#equipment[index]) || DEFAULT_ITEM;
        
        const setSlot = (container, index, value) => {
            if (container === "inventory") {
                this.#inventory[index] = value?.amount > 0 ? value : null;
            } else {
                this.#equipment[index] = value?.amount > 0 ? value : null;
            }
        };
        const isInventoryIndex = (index) => !isNaN(Number(index));
    
        // Update inventory
        this.update_inventory_slots();
    
        // Define slot item
        const container = isInventoryIndex(index) ? "inventory" : "equipment"
        const slot = getSlot(container, index)
        const item = database.get_item(slot.name);
    
        if (!slot.name) {
            console.log("No item to drop at the specified index.", "gm");
            return;
        }
    
        // Clamp amount to drop
        amount = amount ? Math.min(amount, slot.amount) : slot.amount;
    
        if (item.stackable) {
            if (amount < slot.amount) {
                slot.amount -= amount;
                setSlot(container, index, slot); // Update the slot with the new amount
            } else {
                setSlot(container, index, null); // Remove the item if all are dropped
            }
        } else {
            setSlot(container, index, null); // Non-stackable items are removed entirely
        }
    
        this.save();
        this.update_state()
    }

    split_item(index, amount) {
        for(const dest_index in this.inventory) {
            const slot = this.inventory[dest_index]

            // If find empty slot
            if (slot == null) {
                this.move_item(index, dest_index , amount)
                return
            }
        }
    }

    move_item(from_index, to_index, amount) {
        // Validate if not moving to same spot
        if (from_index == to_index) return;

        // Helper function inside move_item (since its not needed elsewhere)
        const isInventoryIndex = (index) => !isNaN(Number(index));
    
        this.update_inventory_slots();
    
        // Constants and configuration
        const DEFAULT_ITEM = { name: null, amount: 0 };
        const DEFAULT_MAX_STACK = 20;
    
        // Determine source and target containers
        const from_container = isInventoryIndex(from_index) ? "inventory" : "equipment";
        const to_container = isInventoryIndex(to_index) ? "inventory" : "equipment";
    
        // Safe access with fallback
        const getSlot = (container, index) => 
            (container === "inventory" ? this.#inventory[index] : this.#equipment[index]) || DEFAULT_ITEM;
        
        const setSlot = (container, index, value) => {
            if (container === "inventory") {
                this.#inventory[index] = value?.amount > 0 ? value : null;
            } else {
                this.#equipment[index] = value?.amount > 0 ? value : null;
            }
        };
    
        // Get items with safe access
        const from_slot = getSlot(from_container, from_index);
        const to_slot = getSlot(to_container, to_index);
    
        // Early exit for invalid moves
        if (!from_slot.name) {
            console.log("No item to move at the source index.", "debug");
            return;
        }
    
        // Validate indices are within bounds
        if ((from_container === "inventory" && from_index >= this.#inventory.length) ||
            (to_container === "inventory" && to_index >= this.#inventory.length)) {
            console.log("Invalid slot index", "debug");
            return;
        }
    
        const item_data = database.get_item(from_slot.name);
        amount = amount ? Math.min(amount, from_slot.amount) : from_slot.amount;
        const isSameItemType = from_slot.name === to_slot.name;
        const canStack = isSameItemType && item_data.stackable;

        // Verify target, if target is equipment and item is not valid for slot stop execution
        const isTargetEquipment = !isInventoryIndex(to_index)
        const isItemValidForSlot = isTargetEquipment ? this.is_valid_item_for_slot(item_data.name, to_index) : true
        if(!isItemValidForSlot) {
            log ("Invalid item for the selected slot")
            return
        }

        // Unequip main hand weapon if offhand impedes its use
        if (isTargetEquipment && ["primary off hand", "secondary off hand"].includes(to_index)) {
            const main_hand_index = to_index == "primary off hand" ? "primary main hand" : "secondary main hand"
            const main_hand_slot = this.#equipment[main_hand_index] || DEFAULT_ITEM
            const main_hand_item = database.get_item(main_hand_slot.name)
            
            if (main_hand_item) {

                const isTwoHanded = main_hand_item.properties.includes("Two-handed")
                const isLight = main_hand_item.properties.includes("Light")
                const offhandIsWeapon = item_data.subtype == "weapon"

                if (isTwoHanded || (!isLight && offhandIsWeapon)) {
                    this.unequip_item(main_hand_index)
                }
            
            }
        }

        // Unequip offhand weapon if mainhand impedes its use
        if (isTargetEquipment && ["primary main hand", "secondary main hand"].includes(to_index)) {
            const off_hand_index = to_index == "primary main hand" ? "primary off hand" : "secondary off hand"
            const off_hand_slot = this.#equipment[off_hand_index] || DEFAULT_ITEM
            const off_hand_item = database.get_item(off_hand_slot.name)

            if (off_hand_item) {

                const isTwoHanded = item_data.properties.includes("Two-handed")
                const isLight = item_data.properties.includes("Light")
                const offhandIsWeapon = off_hand_item.subtype == "weapon"

                if (isTwoHanded || (!isLight && offhandIsWeapon)) {
                    this.unequip_item(off_hand_index)
                }
            
            }
        }

    
        // Case 1: Swap items (different types or non-stackable)
        if ((!isSameItemType || !item_data.stackable) && to_slot.name) {
            // Store original values before swap
            const original_from = {...from_slot};
            const original_to = {...to_slot};
    
            setSlot(from_container, from_index, original_to);
            setSlot(to_container, to_index, original_from);
        }
        // Case 2: Move to empty slot
        else if (!to_slot.name) {
            const transfer_amount = Math.min(amount, from_slot.amount);
            const new_from = {...from_slot, amount: from_slot.amount - transfer_amount};
            
            setSlot(to_container, to_index, {...from_slot, amount: transfer_amount});
            setSlot(from_container, from_index, new_from.amount > 0 ? new_from : null);
        }
        // Case 3: Stack items
        else if (canStack) {
            const max_stack = item_data.max_stack || DEFAULT_MAX_STACK;
            const available_space = max_stack - to_slot.amount;
            const transfer_amount = Math.min(available_space, amount);
    
            const new_to = {...to_slot, amount: to_slot.amount + transfer_amount};
            const new_from = {...from_slot, amount: from_slot.amount - transfer_amount};
    
            setSlot(to_container, to_index, new_to);
            setSlot(from_container, from_index, new_from.amount > 0 ? new_from : null);
        }
    
        this.save();
        this.update_state()
    }

    unequip_item(index) {
        const slot = this.#equipment[index]

        this.drop_item(index)
        this.receive_item(slot.name, slot.amount)
    }

    send_item(index) {
        if (selected().id == impersonated().id) { return }

        if (!selected().inventory) { return }

        let target_has_empty_slot = false
        for (const slot of selected().inventory) {
            if (slot == null) {target_has_empty_slot = true}
        }

        if (!target_has_empty_slot) { return }
        
        const item = this.inventory[index]

        selected().receive_item(item.name, item.amount)
        this.drop_item(index)
    }

    is_valid_item_for_slot(item_name, slot) {
        const item_data = database.get_item(item_name);
        
        // Early return for invalid items
        if (!item_data?.type) {
            console.log("Invalid item data for: " + item_name, "debug");
            return false;
        }
    
        // Configuration: Single source of truth for slot requirements
        const EQUIPMENT_SLOT_RULES = {
            "head":        { allowed_type: "equipment", allowed_subtypes: ["helmet", "hat"] },
            "body":        { allowed_type: "equipment", allowed_subtypes: ["armor", "clothing"] },
            "hands":       { allowed_type: "equipment", allowed_subtypes: ["gloves"] },
            "belt":        { allowed_type: "equipment", allowed_subtypes: ["belt"] },
            "feet":        { allowed_type: "equipment", allowed_subtypes: ["boots"] },
            "amulet":      { allowed_type: "equipment", allowed_subtypes: ["amulet"] },
            "right ring":  { allowed_type: "equipment", allowed_subtypes: ["ring"] },
            "left ring":   { allowed_type: "equipment", allowed_subtypes: ["ring"] },
            "cape":        { allowed_type: "equipment", allowed_subtypes: ["cape"] },
            "ammunition":  { allowed_type: "ammunition", allowed_subtypes: [] }, // Any subtype
            "primary main hand": { allowed_type: "equipment", allowed_subtypes: ["weapon"] },
            "primary off hand": { allowed_type: "equipment", allowed_subtypes: ["weapon", "shield"] },
            "secondary main hand": { allowed_type: "equipment", allowed_subtypes: ["weapon"] },
            "secondary off hand": { allowed_type: "equipment", allowed_subtypes: ["weapon", "shield"] },
        };
    
        // Validate slot exists in rules
        if (!EQUIPMENT_SLOT_RULES.hasOwnProperty(slot)) {
            console.log("Invalid equipment slot: " + slot, "debug");
            return false;
        }
    
        const { allowed_type, allowed_subtypes } = EQUIPMENT_SLOT_RULES[slot];
        
        // 1. Check primary type match
        if (item_data.type !== allowed_type) return false;
    
        // 2. Check subtype requirements (empty array = any subtype allowed)
        const subtypeValid = allowed_subtypes.length === 0 ? true : allowed_subtypes.includes(item_data.subtype);
        
        // 3. Check light weapon for offhand slot
        const isOffhandSlot = ["primary off hand", "secondary off hand"].includes(slot)
        const isWeapon = item_data.subtype == "weapon"
        const isLight = item_data.properties.includes("Light")
        if (isOffhandSlot && isWeapon && !isLight) {
            return false;
        }
    
        return subtypeValid;
    }

    //=====================================================================================================
    // Notes
    //=====================================================================================================

    // Returns ordered array of notes
    get notes() {
        if (Array.isArray(this.#notes)) this.#notes = {} // Backwards compatibility

        let return_notes = []
        for (const title in this.#notes) {
            const {text, order} = this.#notes[title]
            return_notes.push({title, text, order})
        }
        return_notes = [...return_notes].sort((a, b) => a.order - b.order)
        return return_notes
    }

    add_note({text="", title="", order=100}) {
        this.#notes[title] = {title, text, order}
    }

    edit_note(key, {text="", title="", order=100}) {
        this.remove_note(key)
        this.add_note({text, title, order})
    }

    remove_note(title) {
        delete this.#notes[title]
    }

    //=====================================================================================================
    // Instance
    //=====================================================================================================

    constructor(id, reset, inherit) {
        super(id)

        // Reset validation
        const noObject = String(this.token.getProperty("object")) === "null"

        const needsReset = noObject || reset
        if (needsReset) {
            this.#name = this.token.getName();
            console.log(this.#name + " was reset.", "debug");

            // Saves if not inheriting, else sends save as return
            if (!inherit) {this.save()}
        } else {
            if (!inherit) {this.load()}
        }
    }

    //=====================================================================================================
    // MapTool sync
    //=====================================================================================================

    load() {
        const object = JSON.parse(this.token.getProperty("object"));
        
        this.#name = object.name || this.#name;
        this.#type = object.type || this.#type;
        this.#race = object.race || this.#race;
        this.#ability_scores = object.ability_scores || this.#ability_scores;
        this.#speed = object.speed || this.#speed;
        this.#health = object.health ?? this.#health;
        this.#temporary_health = object.temporary_health ?? this.#temporary_health;
        this.#resources = object.resources || this.#resources;
        this.#features = object.features || this.#features;
        this.#proficiencies = object.proficiencies || this.#proficiencies;
        this.#spells = object.spells || this.#spells;
        this.#conditions = object.conditions || this.#conditions;
        this.#equipment = object.equipment || this.#equipment;
        this.#inventory = object.inventory || this.#inventory;
        this.#notes = object.notes || this.#notes;
        this.#spellcasting_level = object.spellcasting_level || this.#spellcasting_level
        this.#attitude = object.attitude || this.#attitude
    }
    
    save() {
        const object = {
            name: this.#name,
            type: this.#type,
            race: this.#race,
            ability_scores: this.#ability_scores,
            speed: this.#speed,
            health: this.#health,
            temporary_health: this.#temporary_health,
            resources: this.#resources,
            features: this.#features,
            proficiencies: this.#proficiencies,
            spells: this.#spells,
            conditions: this.#conditions,
            equipment: this.#equipment,
            inventory: this.#inventory,
            notes: this.#notes,
            spellcasting_level: this.#spellcasting_level,
            attitude: this.#attitude
        };
    
        this.token.setName(this.#name);
        this.token.setProperty("object", JSON.stringify(object));
        this.token.setProperty("class", JSON.stringify(["Creature", "Entity"]));

        return object;
    }

    //=====================================================================================================
}