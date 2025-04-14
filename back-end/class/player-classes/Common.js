"use strict";
try {

    var Common = class {

        //=====================================================================================================
        // Parameters
        //=====================================================================================================

        static actions_list(creature) {
            return {
                attack: this.attack,
                off_hand_attack: this.off_hand_attack,
                grapple: this.grapple,
                push: this.push,
                knock_prone: this.knock_prone,
                cast_spell: this.cast_spell,
                dash: this.dash,
                disengage: this.disengage,
                dodge: this.dodge,
                help: this.help,
                hide: this.hide,
                ready: this.ready,
                search: this.search,
                use_object: this.use_object
            }
        }

        //=====================================================================================================
        // Actions
        //=====================================================================================================

        static attack(creature, target) {
            return
        }

        static off_hand_attack(creature, target) {
            return
        }

        static grapple(creature, target) {
            return
        }

        static push(creature, target) {
            return
        }

        static knock_prone(creature, target) {
            return
        }

        static cast_spell(creature) {
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

        static use_object(creature) {
            return
        }

        //=====================================================================================================

    }

} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack)
}
