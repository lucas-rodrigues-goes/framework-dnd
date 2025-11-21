
const sizeToCells = {
    "Large": 0.5,
    "Huge": 1,
    "Gargantuan": 1.5,
    "Colossal": 2.5
};

const player = MTScript.evalMacro(`[r:player.getName()]`)
const isGM = Number(MTScript.evalMacro(`[r:isGM()]`)) == 1