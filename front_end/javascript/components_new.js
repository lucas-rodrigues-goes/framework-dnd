`[r:'`

//=====================================================================================================
// Create Element
//=====================================================================================================

function element(options) {
    const created_element = document.createElement(options.tag || "div");

    // Set attributes
    if (options.attributes) {
        for (var attr in options.attributes) {
            created_element.setAttribute(attr, options.attributes[attr]);
        }
    }

    // Set styles
    if (options.style) {
        for (var style in options.style) {
            created_element.style[style] = options.style[style];
        }
    }

    // Set text content
    if (options.text) {
        created_element.textContent = options.text;
    }

    // Add event listeners
    if (options.events) {
        for (var event in options.events) {
            created_element.addEventListener(event, options.events[event]);
        }
    }

    // Override appendChild
    created_element.appendChild = function(child) {
        if (typeof child === "string") {
            this.appendChild(element({tag:"span", children:[child]}));
        } else if (child instanceof HTMLElement) {
            Node.prototype.appendChild.call(this, child);
        } else if (typeof child === "object" && child !== null) {
            this.appendChild(element(child));
        } else {
            throw new Error("Invalid child type. Must be a string, HTMLElement, or an object compatible with the element function.");
        }
    };

    // Add appendChildren method
    created_element.appendChildren = function(child) {
        if (Array.isArray(child)) {
            child.forEach(c => this.appendChild(c));
        } else {
            throw new Error("Invalid child type. Must an array.");
        }
    };

    // Add clearChildren method
    created_element.clearChildren = function() {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
    };

    // Append children
    if (options.children) {
        options.children.forEach(child => created_element.appendChild(child));
    }

    // Append to a parent if specified
    if (options.parent) {
        options.parent.appendChild(created_element);
    }

    return created_element;
}

//=====================================================================================================
// Helper Functions
//=====================================================================================================

function options_from_array(array) {
    let return_options = [];
    for (const name of array) {
        return_options.push(
            option({ text: capitalize(name), attributes: { value: name } })
        );
    }
    return return_options;
}

//=====================================================================================================
// Primitive Components
//=====================================================================================================

function span(options) { options.tag = "span"; return element(options); }
function div(options) { options.tag = "div"; return element(options); }
function p(options) { options.tag = "p"; return element(options); }
function pre(options) { options.tag = "pre"; return element(options); }
function option(options) { options.tag = "option"; return element(options); }

//=====================================================================================================
// Components (Standardized to the "container" template)
//=====================================================================================================

function container({ id = "", title = "", parent, children, options = {} } = {}) {
    // Generate unique IDs for inner elements
    const div_id = id ? id + "-div" : "";
    const title_id = id ? id + "-title" : "";

    // Destructure the options object for clarity
    const { div: div_options = {}, content: content_options = {}, title: title_options = {} } = options;
    const { attributes: div_attributes = {}, class: div_class = "" } = div_options;
    const { attributes: content_attributes = {}, class: content_class = "" } = content_options;
    const { attributes: title_attributes = {}, class: title_class = "" } = title_options;

    // Create the element structure with proper classes, ids, and attributes
    const container_element = {
        ...div_options,
        tag: "div",
        attributes: {
            ...div_attributes,
            id: div_id,
            class: "container " + div_class,
        },
        parent,
        children: [
            {
                ...content_options,
                tag: "div",
                attributes: {
                    ...content_attributes,
                    id: id,
                    class: "content " + content_class,
                },
                children,
            },
            {
                ...title_options,
                tag: "h4",
                attributes: {
                    ...title_attributes,
                    id: title_id,
                    class: "container-title " + title_class,
                },
                text: title,
            },
        ],
    };

    // Return the created element
    return element(container_element);
}

function select({ id = "", placeholder = "", parent, children, children_type = "text", options = {} } = {}) {
    // Generate unique IDs
    const div_id = id ? id + "-div" : "";
    const placeholder_id = id ? id + "-placeholder" : "";

    // Destructure sub-options
    const { container: container_options = {}, select: select_options = {}, label: label_options = {} } = options;
    const { attributes: div_attributes = {}, class: div_class = "" } = container_options;
    const { attributes: sel_attributes = {}, class: sel_class = "" } = select_options;
    const { attributes: label_attributes = {}, class: label_class = "" } = label_options;

    // Helper: update select appearance
    function updateSelectState() {
        this.classList.toggle("filled", !!this.value);
    }

    const processedChildren = [
        option({ text: "", attributes: { value: "" } }),
        ...(children_type === "text" ? options_from_array(children) : children || [])
    ];

    return element({
        ...container_options,
        tag: "div",
        attributes: {
            ...div_attributes,
            id: div_id,
            class: "input-container " + div_class
        },
        parent,
        children: [
            {
                ...select_options,
                tag: "select",
                attributes: {
                    ...sel_attributes,
                    id: id,
                    class: sel_class,
                    required: "true"
                },
                events: {
                    ...select_options.events,
                    change: updateSelectState
                },
                children: processedChildren
            },
            {
                ...label_options,
                tag: "label",
                attributes: {
                    ...label_attributes,
                    id: placeholder_id,
                    for: id,
                    class: label_class
                },
                text: placeholder
            }
        ]
    });
}

function input({ id = "", placeholder = "", parent, options = {} } = {}) {
    // Generate unique IDs
    const div_id = id ? id + "-div" : "";
    const placeholder_id = id ? id + "-placeholder" : "";

    // Destructure sub-options
    const { container: container_options = {}, input: input_options = {}, label: label_options = {} } = options;
    const { attributes: div_attributes = {}, class: div_class = "" } = container_options;
    const { attributes: inp_attributes = {}, class: inp_class = "" } = input_options;
    const { attributes: label_attributes = {}, class: label_class = "" } = label_options;

    return element({
        ...container_options,
        tag: "div",
        attributes: {
            ...div_attributes,
            id: div_id,
            class: "input-container " + div_class
        },
        parent,
        children: [
            {
                ...input_options,
                tag: "input",
                attributes: {
                    ...inp_attributes,
                    id: id,
                    type: "text",
                    placeholder: " "
                },
                class: inp_class
            },
            {
                ...label_options,
                tag: "label",
                attributes: {
                    ...label_attributes,
                    id: placeholder_id,
                    for: id,
                    class: label_class
                },
                text: placeholder
            }
        ]
    });
}

function textarea({ id = "", placeholder = "", parent, options = {} } = {}) {
    // Generate unique IDs
    const div_id = id ? id + "-div" : "";
    const placeholder_id = id ? id + "-placeholder" : "";

    // Destructure sub-options
    const { container: container_options = {}, textarea: ta_options = {}, label: label_options = {} } = options;
    const { attributes: div_attributes = {}, class: div_class = "" } = container_options;
    const { attributes: ta_attributes = {}, class: ta_class = "" } = ta_options;
    const { attributes: label_attributes = {}, class: label_class = "" } = label_options;

    // Helper: adjust height on input
    function updateHeight() {
        this.style.height = "";
        this.style.height = `calc(${this.scrollHeight}px)`;
    }

    return element({
        ...container_options,
        tag: "div",
        attributes: {
            ...div_attributes,
            id: div_id,
            class: "input-container " + div_class
        },
        parent,
        children: [
            {
                ...ta_options,
                tag: "textarea",
                attributes: {
                    ...ta_attributes,
                    id: id,
                    type: "text",
                    placeholder: " "
                },
                class: ta_class,
                events: {
                    ...ta_options.events,
                    input: updateHeight
                }
            },
            {
                ...label_options,
                tag: "label",
                attributes: {
                    ...label_attributes,
                    id: placeholder_id,
                    for: id,
                    class: label_class
                },
                text: placeholder
            }
        ]
    });
}

function img({ id = "", src = "", tooltip = "", onclick, parent, options = {} } = {}) {
    // Generate unique IDs
    const span_id = id ? id + "-span" : "";

    // Destructure sub-options
    const { container: container_options = {}, image: image_options = {} } = options;
    const { attributes: span_attributes = {}, class: span_class = "" } = container_options;
    const { attributes: img_attributes = {}, class: img_class = "" } = image_options;

    const events = onclick
        ? { click: onclick, ...image_options.events }
        : image_options.events;

    return element({
        ...container_options,
        tag: "span",
        attributes: {
            ...span_attributes,
            id: span_id,
            class: "tooltip-img " + span_class,
            tooltip: tooltip
        },
        parent,
        children: [
            {
                ...image_options,
                tag: "img",
                attributes: {
                    ...img_attributes,
                    id: id,
                    src: src,
                    class: img_class
                },
                events
            }
        ]
    });
}

function button({ text = "", id = "", onclick, parent, options = {} } = {}) {
    const { button: btn_options = {} } = options;
    const { attributes: btn_attributes = {}, class: btn_class = "" } = btn_options;
    const events = onclick ? { click: onclick, ...btn_options.events } : btn_options.events;

    return element({
        ...btn_options,
        tag: "button",
        parent,
        text: text,
        attributes: {
            ...btn_attributes,
            id: id,
            class: btn_class
        },
        events
    });
}

function checkbox({ text = "", id = "", parent, options = {} } = {}) {
    // Generate unique IDs
    const div_id = id ? id + "-div" : "";
    const text_id = id ? id + "-text" : "";

    // Destructure sub-options
    const { container: container_options = {}, text: text_options = {}, checkbox: cb_options = {} } = options;
    const { attributes: div_attributes = {}, class: div_class = "" } = container_options;
    const { attributes: text_attributes = {}, class: text_class = "" } = text_options;
    const { attributes: cb_attributes = {}, class: cb_class = "" } = cb_options;

    function toggleCheck() {
        const checked = this.getAttribute("checked") === "true";
        this.setAttribute("checked", !checked);
    }

    return element({
        ...container_options,
        tag: "div",
        attributes: {
            ...div_attributes,
            id: div_id,
            class: "checkbox-container " + div_class
        },
        parent,
        children: [
            {
                ...text_options,
                tag: "span",
                attributes: {
                    ...text_attributes,
                    id: text_id,
                    class: "checkbox-text " + text_class,
                    // Using style as a property here; note that in the original code it was set inline.
                    style: "width:4vh"
                },
                text: text
            },
            {
                ...cb_options,
                tag: "div",
                attributes: {
                    ...cb_attributes,
                    id: id,
                    class: "checkbox " + cb_class,
                    checked: "false"
                },
                events: {
                    ...cb_options.events,
                    click: toggleCheck
                }
            }
        ]
    });
}

function grid({ id = "", columns = 3, row_height = "auto", gap = "1vh", children, parent, options = {} } = {}) {
    const { container: container_options = {} } = options;
    const { attributes: div_attributes = {}, class: div_class = "" } = container_options;

    return element({
        ...container_options,
        tag: "div",
        attributes: {
            ...div_attributes,
            id: id,
            class: div_class
        },
        style: {
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: row_height,
            gap: gap
        },
        parent,
        children: children
    });
}

function row({ text = "", parent, columns = ["Image", "Name", "Type", "Actions"], config = "3vh 1fr 1fr 10vh", options = {} } = {}) {
    const { container: container_options = {}, row: row_options = {}, collapsible: coll_options = {} } = options;
    const { attributes: container_attributes = {}, class: container_class = "" } = container_options;
    const { attributes: row_attributes = {}, class: row_class = "" } = row_options;
    const { attributes: coll_attributes = {}, class: coll_class = "" } = coll_options;

    const headerChildren = columns.map(colText => ({ tag: "div", text: colText }));

    return element({
        ...container_options,
        tag: "div",
        attributes: {
            ...container_attributes,
            class: container_class
        },
        parent,
        children: [
            {
                ...row_options,
                tag: "div",
                attributes: {
                    ...row_attributes,
                    class: "table-row " + row_class,
                    style: `grid-template-columns: ${config}`
                },
                children: headerChildren
            },
            {
                ...coll_options,
                tag: "div",
                attributes: {
                    ...coll_attributes,
                    class: "collapsible-content " + coll_class
                },
                text: text
            }
        ]
    });
}

function table({ id = "", headers = ["", "Name", "Type", "Actions"], config = "3vh 1fr 1fr 10vh", parent, options = {} } = {}) {
    const div_id = id ? id + "-div" : "";
    const header_id = id ? id + "-header" : "";

    const { container: container_options = {}, header: header_options = {}, rows: rows_options = {} } = options;
    const { attributes: container_attributes = {}, class: container_class = "" } = container_options;
    const { attributes: header_attributes = {}, class: header_class = "" } = header_options;
    const { attributes: rows_attributes = {}, class: rows_class = "" } = rows_options;

    const headerChildren = headers.map(text => ({ tag: "div", text: text }));

    return element({
        ...container_options,
        tag: "div",
        attributes: {
            ...container_attributes,
            id: div_id,
            class: "table-container " + container_class
        },
        parent,
        children: [
            {
                ...header_options,
                tag: "div",
                attributes: {
                    ...header_attributes,
                    id: header_id,
                    class: "table-header " + header_class,
                    style: `grid-template-columns: ${config}`
                },
                children: headerChildren
            },
            {
                ...rows_options,
                tag: "div",
                attributes: {
                    ...rows_attributes,
                    id: id,
                    class: "table-rows " + rows_class
                }
            }
        ]
    });
}

function tabs({ tab_names = [], parent, id = "", options = {} } = {}) {
    const { container: container_options = {}, switch: switch_options = {}, tab: tab_options = {} } = options;
    const { attributes: container_attributes = {}, class: container_class = "" } = container_options;
    const { attributes: switch_attributes = {}, class: switch_class = "" } = switch_options;
    const { attributes: tab_attributes = {}, class: tab_class = "" } = tab_options;

    const tab_switch_list = [];
    const tab_divs = [];

    function toggleTab() {
        for (const element of tab_switch_list) {
            const tabName = element.attributes.id.replace("-switch", "");
            const button = document.getElementById(tabName + "-switch");
            const tab = document.getElementById(tabName + "-tab");

            if (this === element) {
                button.setAttribute("class", "tab-switch active " + switch_class);
                tab.setAttribute("style", "");
            } else {
                button.setAttribute("class", "tab-switch " + switch_class);
                tab.setAttribute("style", "display:none");
            }
        }
    }

    tab_names.forEach((tab, index) => {
        const switch_id = tab + "-switch";
        const tab_id = tab + "-tab";
        tab_switch_list.push({
            ...switch_options,
            tag: "button",
            text: capitalize(tab),
            attributes: {
                ...switch_attributes,
                id: switch_id,
                class: (index === 0 ? "tab-switch active " : "tab-switch ") + switch_class
            },
            events: {
                ...switch_options.events,
                click: toggleTab
            }
        });
        tab_divs.push({
            ...tab_options,
            tag: "div",
            attributes: {
                ...tab_attributes,
                id: tab_id,
                class: "outer tab " + tab_class,
                style: index === 0 ? "" : "display:none"
            }
        });
    });

    return element({
        ...container_options,
        tag: "div",
        attributes: {
            ...container_attributes,
            class: container_class
        },
        parent,
        children: [
            {
                tag: "div",
                attributes: { class: "tab-switch-div" },
                children: tab_switch_list
            },
            {
                children: tab_divs
            }
        ]
    });
}

//=====================================================================================================

`']`