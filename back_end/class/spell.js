"use strict";
try {

    var Spell = class {

        //=====================================================================================================
        // Spell parameters
        //=====================================================================================================

        #name = ""
        #level = ""
        #school = ""
        #classes = []

        #cast_time = ""
        #range = ""
        #target = ""
        #components = []
        #duration = ""

        #description = ""
        #description_higher_levels = ""


        
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
        // Setter methods
        //=====================================================================================================

        set name(name) {
            if (typeof name != "string") { return; }
            this.#name = name;
        }
        set level(level) {
            valid_level_list = ["cantrip","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"]
            if (!valid_level_list.includes(level)) { return; }

            this.#level = level;
        }
        set school(school) {
            valid_school_list = ["abjuration","conjuration","divination","enchantment",
                                "evocation","illusion","necromancy","transmutation"]
            if (!valid_school_list.includes(school)) { return; }

            this.#school = school;
        }
        set cast_time(cast_time) {
            cast_time = Number(cast_time)
            
            if (cast_time < 1 || cast_time > 12) { return; }

            this.#cast_time = cast_time;
        }
        set range(range) {this.#range = range;}
        set target(target) {this.#target = target;}
        set duration(duration) {this.#duration = duration;}
        set description(description) {this.#description = description;}
        set description_higher_levels(description_higher_levels) {this.#description_higher_levels = description_higher_levels;}

        set classes(classes) {
            valid_classes = ["bard", "druid", "cleric", "sorcerer", "warlock", "wizard"]

            this.#classes = classes.filter(value => valid_classes.includes(value))
        }
        set components(components) {
            valid_components = ["vocal", "somatic", "material"]

            this.#components = components.filter(value => valid_components.includes(value))
        }



        //=====================================================================================================
        // Instance management
        //=====================================================================================================

        constructor(name, level, school, classes,
            cast_time, range, target, components, duration,
            description, description_higher_levels) {
            
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
