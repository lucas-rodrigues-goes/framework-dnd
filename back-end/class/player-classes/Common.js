"use strict";
try {

    var Common = class {

        //=====================================================================================================
        // Parameters
        //=====================================================================================================

        static actions_list(creature) {
            const actions = {
                attack: {
                    resources: ["Attack Action"],
                    description: "Use your main equipped weapon (or fists) to deliver a blow to th enemy.",
                },
                grapple: {
                    resources: ["Attack Action"],
                    description: "Attempt to grapple th enemy, impeding their movement.",
                },
                push: {
                    resources: ["Attack Action"],
                    description: "Attempt to push th enemy 5ft.",
                },
                knock_prone: {
                    resources: ["Attack Action"],
                    description: "Attempt to knock down th enemy.",
                },
                dash: {
                    resources: ["Action"],
                    description: "Gain additional movement equal to your speed.",
                },
                disengage: {
                    resources: ["Action"],
                    description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
                },
                dodge: {
                    resources: ["Action"],
                    description: "Focus on avoiding attacks. Attack rolls against you have disadvantage.",
                },
                help: {
                    resources: ["Action"],
                    description: "Aid another creature in attacking or avoiding attacks.",
                },
                hide: {
                    resources: ["Action"],
                    description: "Attempt to hide from enemies using Stealth.",
                },
                ready: {
                    resources: ["Action"],
                    description: "Prepare to take an action later in response to a trigger.",
                },
                search: {
                    resources: ["Action"],
                    description: "Devote your attention to finding something using Perception or Investigation.",
                },
            }

            // Conditional Actions
            const off_hand_slot = creature?.equipment["primary off hand"]?.name
            const hasOffHandWeapon = off_hand_slot ? database.items.data[off_hand_slot.name].subtype == "weapon" : false
            if (hasOffHandWeapon) {
                actions["off_hand_attack"] = {
                    resources: ["Bonus Action"],
                    description: "Use your off hand weapon to deliver a blow to th enemy.",
                }
            }
        }

        //=====================================================================================================
        // Helpers
        //=====================================================================================================

        static has_resources_available(creature, resources) {
            for (const name of resources) {
                const resource = creature?.resources[name]?.value || 0
                if (name == "Attack Action") {
                    const action_res = creature?.resources["Action"]?.value || 0

                    return (resource > 0 || action_res > 0)
                }
                return 
                
            }
        }

        //=====================================================================================================
        // Actions
        //=====================================================================================================

        static attack(creature) {
            const actions_list = this.actions_list(creature)

            // Validation
            if (!selected()) return // --> has no target
            if (!actions_list?.attack) return //--> no access to action
            if (!this.has_resources_available(creature, actions_list.attack.resources)) return // no resources

            // Attack
            const weapon = database.data.items[creature?.equipment["primary main hand"]?.name] || undefined
            const damage_list = weapon.damage || {die_ammount: 1, die_size: 1, damage_type: "Bludgeoning"}

            // Creature Modifiers
            const str_bonus = creature.score_bonus["strength"]
            const dex_bonus = isFinesse || isAmmo ? creature.score_bonus["dexterity"] : 0
            const damage_bonus = Math.max(str_bonus, Math.min(dex_bonus, 3))
            const hit_bonus = Math.max(Math.min(str_bonus, 3), dex_bonus) + 2

            // Calculate Hit
            const roll = Math.ceil(Math.random() * 20)
            let roll_result
            if (roll == 20) roll_result = "critical hit"
            else if (roll == 1) roll_result = "critical fail"
            else if (roll + hit_bonus >= selected().armor_class) roll_result = "hit"
            else roll_result = "fail"

            // If attack hits
            if (["critical hit", "hit"].includes(roll_result)) {

                // Calcualate damage
                const crit_multiplier = roll_result == "critical hit" ? 1 : 0
                const damage_composition = {}
                for (const damage of damage_list) {
                    let total_damage = 0
                    for (let i = 0; i < damage.die_amount * crit_multiplier; i++) {
                        total_damage += Math.ceil(Math.random() * die_size)
                    }
                    damage_composition[damage.damage_type] = (damage_composition[damage.damage_type] ?? 0) + total_damage;

                }

            }

            

            return
        }

        static off_hand_attack(creature) {
            return
        }

        static grapple(creature) {
            return
        }

        static push(creature) {
            return
        }

        static knock_prone(creature) {
            return
        }

        static dash(creature) {
            return
        }

        static disengage(creature) {
            return
        }

        static dodge(creature) {
            return
        }

        static help(creature) {
            return
        }

        static hide(creature) {
            return
        }
        
        static ready(creature) {
            return
        }

        static search(creature) {
            return
        }

        //=====================================================================================================

    }

} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack)
}
