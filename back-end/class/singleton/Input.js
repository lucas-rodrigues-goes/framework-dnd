const input_example = {
    "Key name": {
        value: "string", //-> Default value for the field
        label: "string", //-> Title for the field
        type: "string", //-> text | list | checkbox | radio
        options: {
            // Text
            width: 16,
            span: true,

            // List
            select: 0,
        }
    }
}

var input = function(fields) {
    // Generate the input macro command
    let macroLines = [];
    for (let key in fields) {
        const field = fields[key];
        const value = field.value || "";
        const label = field.label || key;
        const type = field.type.toUpperCase() || "TEXT";
        
        let options = ""
        if (field.options) {
            for (const key in (field.options)) {
                options += `${key.toUpperCase()}=${field.options[key].toUpperCase()} `
            }
        }
        
        macroLines.push(`"${key} | ${value} | ${label} | ${type} | ${options}"`);
    }

    // Execute the macro
    const macro = `
        [h: status = input(
            ${macroLines.join(",\n            ")}
        )]
        [h: abort(status)]
        [h: output = "{}"]
        [h, foreach(key, '${JSON.stringify(Object.keys(fields))}'): 
            output = json.set(output, key, eval(key))
        ]
        [r: output]
    `;

    const result = MTScript.evalMacro(macro);
    return JSON.parse(result);
};