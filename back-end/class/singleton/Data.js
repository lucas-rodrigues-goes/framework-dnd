

var data = class {

    // Condition
    static get condition () {
        const cls = "condition"

        // Create
        const create = ({name="", type="", duration=0, description="", image=""}) => {
            // Type
            type = type.toLowerCase()
            const valid_types = ["spell", "natural", "curse", "poison", "special"]
            if (!valid_types.includes(type)) {
                console.log(`Invalid type "${type}" for "${cls}" object."`, "debug")
                type = ""
            }

            // Object
            return { name, type, duration, description, image, cls}
        }

        return { create }
    }

    // Damage Type
    static get damage_type () {
        const cls = "damage type"

        // Create
        const create = ({name="", type="", description="", image=""}) => {
            // Type
            type = type.toLowerCase()
            const valid_types = ["physical", "elemental", "special"]
            if (!valid_types.includes(type)) {
                console.log(`Invalid type "${type}" for "${cls}" object."`, "debug")
                type = ""
            }

            // Object
            return { name, type, description, image, cls }
        }

        return { create }
    }

    // Feature
    static get feature () {
        const cls = "feature"

        // Create
        const create = ({name="", type="", subtype=undefined, level=0, optional=true, description="", image=""}) => {
            // Type
            const valid_types = ["racial", "class", "feat", "other"]
            if (!valid_types.includes(type)) {
                console.log(`Invalid type "${type}" for "${cls}" object."`, "debug")
                type = ""
            }

            // Subtype
            if (type != "class") subtype = undefined

            // Level
            level = Number(level)
            if (level < 0 || level > 20) level = 0

            // Object
            return { name, type, subtype, level, optional, description, image, cls }
        }

        return { create }
    }

    // Item
    static get item () {
        const cls = "item"

        // Create
        const create = ({
            // Item
            name="",
            type="", 
            subtype="", 
            description="",
            image="",
            weight=1,
            rarity="common",
            price=0,
            stackable=true,
            max_stack=20,
            properties=[],

            // Equipment-only
            bonus_armor_class=0,
            resistances={},
            conditions=[],

            // Weapon-only
            damage = [{
                die_ammount: 1,
                die_size: 4,
                damage_type: "Piercing",
                damage_bonus: 0,
            }],
            recovery = 0,
            range = [5],

            // Armor-only
            base_armor_class=0,
        }) => {
            // Subtype
            const equipment_subtypes = ["weapon", "armor"]
            if (type != "equipment") {if (equipment_subtypes.includes(subtype)) subtype = ""}

            // Rarity
            rarity = rarity.toLowerCase()
            const valid_rarities = ["common", "uncommon", "rare", "very rare", "legendary"]
            if (!valid_rarities.includes(rarity)) {
                console.log(`Invalid type "${rarity}" for "${cls}" object."`, "debug")
                rarity = ""
            }

            // Object
            let object = { name, type, description, image, weight, rarity, price, stackable, max_stack, properties, cls }; {
                // Type
                switch (type) {
                    // Equipment
                    case "equipment":
                        object = {...object, bonus_armor_class, resistances, conditions}
                        break
                }

                // Subtype
                if (subtype) object = {...object, subtype}
                switch (subtype) {
                    // Weapon
                    case "weapon":
                        object = {...object, damage, recovery, range} 
                        break

                    // Armor
                    case "armor":
                        object = {...object, base_armor_class}
                        break
                }
            }
            return object
        }

        return { create }
    }

    // Proficiency
    static get proficiency () {
        const cls = "proficiency"

        // Create
        const create = ({name="", type="", description=[], image=""}) => {
            // Type
            const valid_types = ["skill", "weapon", "combat", "save", "tool", "language"]
            if (!valid_types.includes(type)) {
                console.log(`Invalid type "${type}" for "${cls}" object."`, "debug")
                type = ""
            }

            // Description
            const level_description = []
            for (let i = 0; i < description.length; i++) {
                let current_description = ""
                for (let j = 0; j <= i; j++) {
                    current_description += description[j]
                }
                level_description.push(current_description)
            }

            // Object
            return { name, type, description, level_description, image, cls }
        }

        return { create }
    }

    // Race
    static get race () {
        const cls = "race"

        // Create
        const create = ({name="", features=[], proficiencies=[], ability_scores={}, description=""}) => {
            // Object
            return {
                name,
                features, 
                proficiencies, 
                ability_scores, 
                description,
                cls
            }
        }

        return { create }
    }

    // Resource
    static get resource () {
        const cls = "resource"

        // Create
        const create = ({name="", color="", description="", image=""}) => {
            // Object
            return { name, color, description, image, cls }
        }

        return { create }
    }

    // Spell
    static get spell () {
        const cls = "spell"

        // Create
        const create = ({
            name = "", 
            level = "1st", 
            school = "", 
            classes = [],
            cast_time = 0,
            range = 0,
            components = [],
            duration = 0,
            description = "", 
            description_higher_levels = "",
            image = "",
        }) => {
            // Level
            level = level.toLowerCase()
            const valid_levels = ["cantrip","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"]
            if (!valid_levels.includes(level)) {
                console.log(`Invalid level "${level}" for "${cls}" object."`, "debug")
                level = "1st"
            }

            // School
            school = school.toLowerCase()
            const valid_schools = ["abjuration","conjuration","divination","enchantment","evocation","illusion","necromancy","transmutation"]
            if (!valid_schools.includes(school)) {
                console.log(`Invalid level "${school}" for "${cls}" object."`, "debug")
                school = ""
            }

            // Cast Time
            cast_time = Number(cast_time)
            if (cast_time < -2 || cast_time > 12) cast_time = 0

            // Components
            let old_components = components; components = []
            const valid_components = ["vocal", "somatic", "material", "concentration"]
            for (const comp of old_components) {
                const component = comp.toLowerCase()
                if (!valid_components.includes(component)) {
                    console.log(`Invalid component "${component}" for "${cls}" object."`, "debug")
                    continue
                }
                components.push(component)
            }

            // Object
            return { name, level, school, classes, cast_time, range, components, duration, description, description_higher_levels, image, cls }
        }

        return { create }
    }
}
