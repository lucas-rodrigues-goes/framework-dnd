`[r:'`

//=====================================================================================================
// Create Element
//=====================================================================================================

/* Creates a new HTMLElement dinamically.

Parameters accepted include:
    tag: Determines tag of the element, defaults to "div"
    text: Determine textContent of the element, should be a string
    parent: Calls appendChild on the element specified here to append this element.
    attributes: An object attribute:value
    style: An object style:value
    events: An object event:function
    children: An array of either: 
        - Objects (with parameters like the ones specified here). 
        - HTMLElements.
        - Strings (converted to span elements).
        
Also rewrites and adds some new methods to all elements created this way:
    appendChild: Now also accepts objects following these paremters and strings
    appendChildren: Works like appendChild but receives an array
    clearChildren: Removes all children, also removing their listeners

*/
function element(options) {
    const created_element = document.createElement(options.tag || "div");

    // Set attributes
    if (options.attributes) {
        for (let attr in options.attributes) {
            created_element.setAttribute(attr, options.attributes[attr]);
        }
    }

    // Set styles
    if (options.style) {
        for (let style in options.style) {
            created_element.style[style] = options.style[style];
        }
    }

    // Set text content
    if (typeof options.text === "string") {
        created_element.textContent = options.text;
    }

    // Add event listeners
    if (options.events) {
        for (let event in options.events) {
            created_element.addEventListener(event, options.events[event]);
        }
    }

    // Override appendChild method safely
    Object.defineProperty(created_element, "appendChild", {
        value: function (child) {
            if (typeof child === "string") {
                Node.prototype.appendChild.call(this, element({ tag: "span", text: child }));
            } else if (child instanceof HTMLElement) {
                Node.prototype.appendChild.call(this, child);
            } else if (typeof child === "object" && child !== null) {
                Node.prototype.appendChild.call(this, element(child));
            } else {
                throw new Error("Invalid child type. Must be a string, HTMLElement, or an object compatible with the element function.");
            }
        }
    });

    // Add appendChildren method
    Object.defineProperty(created_element, "appendChildren", {
        value: function (children) {
            if (Array.isArray(children)) {
                children.forEach(child => this.appendChild(child));
            } else {
                throw new Error("Invalid children type. Must be an array.");
            }
        }
    });

    // Add clearChildren method
    Object.defineProperty(created_element, "clearChildren", {
        value: function () {
            while (this.firstChild) {
                if (this.firstChild instanceof HTMLElement) {
                    this.firstChild.replaceWith(); // Ensures event listeners are removed
                } else {
                    this.removeChild(this.firstChild);
                }
            }
        }
    });

    // Append children if provided
    if (Array.isArray(options.children)) {
        options.children.forEach(child => created_element.appendChild(child));
    }

    // Append to parent if specified and valid
    if (options.parent instanceof HTMLElement) {
        options.parent.appendChild(created_element);
    }

    return created_element;
}


//=====================================================================================================
// Components
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

    // Options
    const { div: div_options = {}, checkbox: checkbox_options = {}, title: title_options = {} } = options;
    const { attributes: div_attributes = {} } = div_options;
    const { attributes: checkbox_attributes = {} } = checkbox_options;
    const { attributes: title_attributes = {} } = title_options;

    // Element
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

function collapsible({parent, button_children = [], children = [], options = {}}) {

    // Toggle collapsible visibility
    function click (event) {
        // Check if the click originated from a button
        if (["IMG", "BUTTON"].includes(event.target.tagName)) {
            event.stopPropagation();
            return;
        }

        // Find the next sibling expandable content
        const content = this.nextElementSibling;

        // Toggle visibility with animation
        if (content.classList.contains("show")) {
            content.style.maxHeight = null;
            content.classList.remove("show");
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
            content.classList.add("show");
        }
    }

    // Options
    const { div: div_options = {}, button: button_options = {}, content: content_options = {} } = options;
    const { attributes: button_attributes = {}, events: button_events = {} } = button_options;
    const { attributes: content_attributes = {} } = content_options;

    // Element
    return element(
        {...div_options, 
            tag: "div",
            parent,
            children: [
                {...button_options,
                    tag: "div", 
                    attributes: {...button_attributes,
                        class: "collapsible-div " + (button_attributes.class || "")
                    }, 
                    events: {...button_events, click},
                    children: button_children
                },
                {...content_options,
                    tag: "div", 
                    attributes: {...content_attributes,
                        class: "collapsible-content" + (content_attributes.class || "")
                    },
                    children
                }
        ]}
    )
}

function create_tabs({content=[], parent}) {
    const tab_switch_buttons = []
    const tabs = []

    // Function
    function click(event) {
        const clicked_button = event.currentTarget;
        const current_tab = clicked_button.id.replace("-switch", "");
    
        // Toggle visibility
        content.forEach(name => {
          const button = document.getElementById(name + "-switch");
          const tab = document.getElementById(name + "-tab");
          
          if (name === current_tab) {
            button.classList.add("active");
            tab.style.display = "";
          } else {
            button.classList.remove("active");
            tab.style.display = "none";
          }
        });
      }

    // Create buttons and tabs for each tab name in content
    for (const i in content) {
        const tab_name = content[i]

        // Tab button
        const button_classes = i == 0 ? "tab-switch active" : "tab-switch"
        tab_switch_buttons.push(element(
            {tag: "button", attributes: {class: button_classes, id: tab_name + "-switch"}, events: {click}, text: capitalize(tab_name)}
        ))

        // Tab
        const tab_display = i == 0 ? "" : "none"
        tabs.push(element(
            {tag: "div", attributes: {class: "outer tab", id: tab_name + "-tab"}, style: {display: tab_display}}
        ))

    }

    // Buttons div
    const button_div = element({tag: "div", attributes: {class: "tab-switch-div"}, children: tab_switch_buttons})
    const tab_div = element({tag: "div", children: tabs})

    return element(
        {tag: "div", parent, children: [
            button_div,
            tab_div
        ]}
    )
}




//=====================================================================================================

`']`