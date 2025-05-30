const input_example = {
    "Key name": {
        value: "", //-> Default value for the field
        label: "", //-> Title for the field
        type: "text", //-> text | list | check | radio | label, props, tab
        options: {
            // Text
            width: 16,
            span: true,

            // List
            select: 0,
            value: "number", //-> number | string
            icon: false, //-> (If the string for the item contains a space and then an image asset URL, the image is displayed in the entry)
            iconsize: 50,
            text: true, //-> (No text is shown in the list entries next to the icons; defaults to TEXT=TRUE, and is ignored if no icon is set)
            span: false, // -> (Causes the prompt to be hidden and allows the inputField to span the width of the dialog; defaults to SPAN=FALSE. If hidden the prompt text is used as a tooltip.)
            delimiter: ",", //-> (The delimiter used in the list; defaults to the comma ,. The delimiter cannot contain empty spaces. If set to JSON, a JSON Array should be provided)

            // Check
            span: false, //-> (Causes the prompt to be hidden and allows the inputField to span the width of the dialog; defaults to SPAN=FALSE. If hidden the prompt text is used as a tooltip.)

            // Radio
            orient: "v", //-> v | h (Arranges the radio buttons horizontally or vertically on a single line; defaults to ORIENT=V.)
            select: 0, //-> (sets the initially selected item, default is 0)
            value: "number", //-> number | string
            span: false, //-> (Causes the prompt to be hidden and allows the inputField to span the width of the dialog; defaults to SPAN=FALSE. If hidden the prompt text is used as title placed in the border of the radio button group.)
            delimiter: ",", //-> (    The delimiter used in the list; defaults to the comma ,. The delimiter cannot contain empty spaces. If set to JSON, a JSON Array should be provided instead.)

            // Label
            icon: false, //-> (If the string for the value contains a space and then an image asset URL, the image is displayed; defaults to ICON=FALSE)
            iconsize: 50,
            text: true, //-> (The value is not shown; defaults to TEXT=TRUE.)
            span: false, //-> (Causes the prompt to be hidden and allows the inputField to span the width of the dialog; defaults to SPAN=FALSE. If hidden the prompt text is used as a tooltip.)

            // Props
            setvars: "none", //-> none | suffixed | unsuffixed (Makes a variable assignment for each of the sub-values, with an underscore appended to the name; defaults to SETVARS=NONE.)
            span: false, //-> true | false
            width: 14,
            type: "JSON", //-> Default is string property list

            // Tab
            select: false, //-> true | false (Causes this tab to be displayed when the dialog appears)
        }
    }
}

var input = function(fields) {
    // Generate the input macro command
    let macroLines = [];
    const return_fields = []
    for (let key in fields) {
        const field = fields[key];
        const value = field.value || "";
        const label = `<html><b>${field.label || key}</b></html>`;
        const type = (field.type || "TEXT").toUpperCase();
        if (type != "LABEL") return_fields.push(key)
        
        let options = ""
        if (field.options) {
            for (const key in (field.options)) {
                options += `${key.toUpperCase()}=${String(field.options[key]).toUpperCase()} `
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
        [h, foreach(key, '${JSON.stringify(return_fields)}'): 
            output = json.set(output, key, eval(key))
        ]
        [r: output]
    `;

    const result = MTScript.evalMacro(macro);
    return JSON.parse(result);
};