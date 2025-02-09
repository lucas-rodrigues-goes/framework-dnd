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
// Components (Standardized to the "container" template)
//=====================================================================================================

function container({ id = "", title = "", parent, children, options = {} } = {}) {

    // Destructure the options
    const { div: div_options = {}, content: content_options = {}, title: title_options = {} } = options;
    const { attributes: div_attributes = {} } = div_options;
    const { attributes: content_attributes = {} } = content_options;
    const { attributes: title_attributes = {} } = title_options;

    // Element
    return element(
        {...div_options,
            tag: "div",
            parent,
            attributes: {...div_attributes,
                id: id + "-div",
                class: "container " + (div_attributes.class || ""),
            },
            children: [
                {...content_options, 
                    tag: "div", 
                    children,
                    attributes: {...content_attributes,
                        id: id,
                        class: "content " + (content_attributes.class || ""),
                    }
                },
                {...title_options,
                    tag: "h4",
                    text: title,
                    attributes: {...title_attributes,
                        id: id + "-title",
                        class: "container-title " + (title_attributes.class || ""),
                    }
                },
            ],
        }
    );
}

function input({ id = "", placeholder = "", parent, options = {} }) {
    
    // Destructure the options
    const { div: div_options = {}, input: input_options = {}, placeholder: placeholder_options = {} } = options;
    const { attributes: div_attributes = {} } = div_options;
    const { attributes: input_attributes = {} } = input_options;
    const { attributes: placeholder_attributes = {} } = placeholder_options;
    
    // Element
    return element(
        {...div_options,
            tag: "div", 
            parent,
            attributes: {...div_attributes, 
                id: id + "-div",
                class: "input-container " + (div_attributes.class || "")
            },
            children: [
                {...input_options,
                    tag: "input", 
                    attributes: {...input_attributes,
                        id,
                        placeholder: " ", 
                        type: "text"
                    }
                },
                {...placeholder_options,
                    tag: "label",
                    text: placeholder,
                    attributes: {
                        ...placeholder_attributes,
                        id: id + "-placeholder",
                        for: id
                    }
                }
            ]
        }
    )
}

function textarea({ id = "", placeholder = "", parent, options = {} }) {
    
    // Destructure the options
    const { div: div_options = {}, input: input_options = {}, placeholder: placeholder_options = {} } = options;
    const { attributes: div_attributes = {} } = div_options;
    const { attributes: input_attributes = {}, events: input_events } = input_options;
    const { attributes: placeholder_attributes = {} } = placeholder_options;
    
    // Auto height
    function autoHeight () {
        this.style.height = ""
        this.style.height = this.scrollHeight + "px"
    }

    // Element
    return element(
        {...div_options,
            tag: "div", 
            parent,
            attributes: {...div_attributes, 
                id: id + "-div",
                class: "input-container " + (div_attributes.class || "")
            },
            children: [
                {...input_options,
                    tag: "textarea", 
                    attributes: {...input_attributes,
                        id,
                        placeholder: " ", 
                        type: "text",
                        rows: 1
                    },
                    events: {...input_events,
                        input: autoHeight
                    }
                },
                {...placeholder_options,
                    tag: "label",
                    text: placeholder,
                    attributes: {
                        ...placeholder_attributes,
                        id: id + "-placeholder",
                        for:id
                    }
                }
            ]
        }
    )
}

function checkbox({ id = "", title = "", parent, options = {}}) {

    // Destructure the options
    const { div: div_options = {}, checkbox: checkbox_options = {}, title: title_options = {} } = options;
    const { attributes: div_attributes = {} } = div_options;
    const { attributes: checkbox_attributes = {} } = checkbox_options;
    const { attributes: title_attributes = {} } = title_options;

    return element(
        {...div_options,
            tag: "div",
            parent,
            attributes: {...div_attributes,
                class: "checkbox-container " + (div_attributes.class || ""),
                id: id + "-div"
            },
            children: [
                {...title_options,
                    tag: "span",
                    text: title,
                    attributes: {...title_attributes,
                        id: id + "-title",
                        class: "checkbox-text " + (title_attributes.class || "")
                    }
                },
                {...checkbox_options,
                    tag: "div",
                    attributes: {...checkbox_attributes,
                        id,
                        checked: false,
                        class: "checkbox " + (checkbox_attributes.class || "")
                    }
                }
            ]
        }
    )
}




//=====================================================================================================

`']`