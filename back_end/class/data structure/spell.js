"use strict";
try {

    var Spell = class {

        //=====================================================================================================
        // Spell parameters
        //=====================================================================================================

        #name
        #level
        #school
        #classes

        #cast_time
        #range
        #target
        #components
        #duration

        #description
        #description_higher_levels


        
        //=====================================================================================================
        // Getter methods
        //=====================================================================================================

        get name() { return this.#name; }
        get level() { return this.#level; }
        get school() { return this.#school; }
        get cast_time() { return this.#cast_time; }
        get range() { return this.#range; }
        get target() { return this.#target; }
        get duration() { return this.#duration; }
        get description() { return this.#description; }
        get description_higher_levels() { return this.#description_higher_levels; }

        get classes() { return this.#classes; }
        get components() { return this.#components; }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(
            name = "", 
            level = "1st", 
            school = "", 
            classes = [],
            cast_time = 0, // from 0 to 12
            range = 0, // self, touch, sight, unlimited, special 
            target = "",
            components = [], // vocal, somatic, material, concentration
            duration = 0, // 0 for instantaneous
            description = "", 
            description_higher_levels = ""
        ) {

            // Validate Level
            if (![
                "cantrip","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"
            ].includes(level)) { return }

            // Validate School of Magic
            if (![
                "abjuration","conjuration","divination","enchantment","evocation","illusion","necromancy","transmutation"
            ].includes(school)) { return }

            // Validate Cast Time
            if (Number(cast_time) < 1 || Number(cast_time) > 12) { return }

            // Remove Invalid Spellcasting Classes
            classes = classes.filter(value => [
                "bard", "druid", "cleric", "sorcerer", "warlock", "wizard"
            ].includes(value))

            // Remove invaild components
            components = components.filter(value => [
                "vocal", "somatic", "material", "concentration"
            ].includes(value))
            
            // Instancing
            this.#name = name
            this.#level = level
            this.#school = school
            this.#classes = classes
            this.#cast_time = cast_time
            this.#range = range
            this.#target = target
            this.#components = components
            this.#duration = duration
            this.#description = description
            this.#description_higher_levels = description_higher_levels

        }

        object() {
            return {
                "name": this.#name,
                "level": this.#level,
                "school": this.#school,
                "classes": this.#classes,
                "cast_time": this.#cast_time,
                "range": this.#range,
                "target": this.#target,
                "components": this.#components,
                "duration": this.#duration,
                "description": this.#description,
                "description_higher_levels": this.#description_higher_levels
            };
        }

        //=====================================================================================================
    }


} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
