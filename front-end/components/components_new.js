`[r:'`

//=====================================================================================================
// Create Element
//=====================================================================================================

/* Creates a new HTMLElement dinamically.

Parameters accepted include:
    tag: Determines tag of the element, defaults to "div"
    text: Determine textContent of the element, should be a string
    textHTML: Overrides text, accepts HTML tags for its content.
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
    if (options.text || options.text == 0) {
        created_element.textContent = String(options.text);
    }

    // Set text content with HTML tags
    if (options.textHTML || options.textHTML == 0) {
        created_element.textContent = "";
        created_element.insertAdjacentHTML("beforeend", String(options.textHTML));
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
            }
        }
    });

    // Add appendChildren method
    Object.defineProperty(created_element, "appendChildren", {
        value: function (children) {
            if (Array.isArray(children)) {
                children.forEach(child => this.appendChild(child));
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

function container({ id = "", title = "", parent, scroll = false, children, options = {} } = {}) {

    // Destructure the options
    const { div: div_options = {}, content: content_options = {}, title: title_options = {} } = options;
    const { attributes: div_attributes = {} } = div_options;
    const { attributes: content_attributes = {}, style: content_style } = content_options;
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
                        class: "container-content " + (content_attributes.class || ""),
                    },
                    style: scroll ? { overflow: "scroll", height: "100%", ...content_style } : content_style
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

function textarea_auto_height() {
    this.style.height = ""
    this.style.height = (this.scrollHeight + 5) + "px"
}
function textarea({ id = "", placeholder = "", parent, options = {} }) {
    
    // Destructure the options
    const { div: div_options = {}, input: input_options = {}, placeholder: placeholder_options = {} } = options;
    const { attributes: div_attributes = {} } = div_options;
    const { attributes: input_attributes = {}, events: input_events } = input_options;
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
                    tag: "textarea", 
                    attributes: {...input_attributes,
                        id,
                        placeholder: " ", 
                        type: "text",
                        rows: 1
                    },
                    events: {
                        input: textarea_auto_height,
                        ...input_events
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

function select({ id = "", placeholder = "", parent, children = [], options = {} }) {

    // Functions
    function updatePlaceholders () {
        if (this.value) {
            this.classList.add("filled")
        } else {
            this.classList.remove("filled")
        }
    }

    // Destructure the options
    const { div: div_options = {}, input: input_options = {}, placeholder: placeholder_options = {} } = options;
    const { attributes: div_attributes = {} } = div_options;
    const { attributes: input_attributes = {}, events: input_events } = input_options;
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
                    tag: "select", 
                    attributes: {...input_attributes,
                        id,
                        required: true,
                    },
                    events: {...input_events,
                        change: updatePlaceholders
                    },
                    children: [
                        {tag: "option", attributes: {value: ""}, text: " "},
                        ...children
                    ]
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

function modal({children = [], options = {}, parent = document.body}) {
    // Options
    const { div: div_options = {}, content: content_options = {} } = options;
    const { style: div_style = {}, events: div_events = {}, attributes: div_attributes = {} } = div_options;
    const { events: content_events = {} } = content_options;

    // Content click behavior
    function content_click (event) {
        event.stopPropagation()

        if (content_events.click) {
            content_events.click()
        }
    }

    // Element
    return element(
        {...div_options,
            tag: "div",
            parent: parent,
            attributes: {...div_attributes,
                id: "modal"
            },
            style: {...div_style,
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                margin: "0",
                height: "100%",
                width: "100%",
                zIndex: "10000",
            },
            events: {...div_events,
                click: close_modal
            },
            children: [
                {...content_options,
                    tag: "div",
                    events: {...content_events,
                        click: content_click
                    },
                    children: children
                }
            ]
        }
    )
}
function close_modal() {
    document.getElementById("modal").remove()
}

// Buttons object receives "title: function"
function context_menu({buttons = {}, options = {}, parent = document.body, event}) {
    if (Object.keys(buttons).length == 0) return

    // Options
    const { div: div_options = {}, content: content_options = {} } = options;
    const { style: div_style = {}, events: div_events = {}, attributes: div_attributes = {} } = div_options;
    const { events: content_events = {} } = content_options;

    // Content click behavior
    function content_mousedown (event) {
        event.stopPropagation()

        if (content_events.mousedown) {
            content_events.mousedown()
        }
    }

    // Create buttons
    const children = []
    for (const button_title in buttons) {
        const button_click = buttons[button_title]

        children.push({
            tag: "li", 
            text: button_title,
            events: {click: () => {button_click(); close_context_menu()}}
        })
    }

    // Element
    const return_element = element(
        {...div_options,
            tag: "div",
            parent: parent,
            attributes: {...div_attributes,
                id: "context-menu"
            },
            style: {...div_style,
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                margin: "0",
                height: "100%",
                width: "100%",
                zIndex: "10000",
            },
            events: {...div_events,
                mousedown: close_context_menu,
            },
            children: [
                {...content_options,
                    tag: "div",
                    style: {width: "fit-content"},
                    events: {...content_events,
                        mousedown: content_mousedown,
                    },
                    children: children
                }
            ]
        }
    );

    // Position the content and handle viewport edges
    function position_menu() {
        const content = return_element.children[0]

        const rect = content.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = event.clientX - 1;
        let top = event.clientY - 1;

        // Adjust horizontal position if needed
        if (left + rect.width > viewportWidth) {
            left = viewportWidth - rect.width - 8;
        }

        // Adjust vertical position if needed
        if (top + rect.height > viewportHeight) {
            top = viewportHeight - rect.height - 8;
        }

        content.style.position = "absolute"
        content.style.left = left + `px`;
        content.style.top = top + `px`;
    }
    position_menu();

    return return_element
}
function close_context_menu() {
    for (const element of document.querySelectorAll("#context-menu")) {
        element.remove()
    }
}

function point_buy_calculator() {
    const ability_scores = ["strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma"]

    // Functions
    function updateView() {
        document.getElementById("point-buy-points").textContent = availablePoints()

        for (const score of ability_scores) {
            const ability_score = document.getElementById(score)
            const ability_score_bonus = document.getElementById("bonus-" + score)

            const show_value = Number(ability_score.textContent)
            const bonus_value = Math.floor((show_value - 10) / 2)
            ability_score_bonus.textContent = bonus_value > 0 ? "+" + bonus_value : bonus_value
        }
    }
    function availablePoints() {
        let total_points = 27
        for (const score of ability_scores) {
            const ability_score = document.getElementById(score)
            const value = Number(ability_score.getAttribute("value"))

            const additional_cost = Math.max(value - 13, 0)
            const cost = Math.max(value - 8, 0)
            total_points = total_points - cost - additional_cost
        }
        return total_points
    }
    function ability_score_box(score) {
        return {tag: "div", attributes: {class: "score"}, children: [
            {tag: "div", attributes: {class: "score-label"}, text: capitalize(score)},
            {tag: "div", attributes: {class: "score-value", id: score, value: 10}, text: "10"},
            {tag: "div", attributes: {class: "score-bonus", id: "bonus-" + score, value: 0}, text: "0"},
            {tag: "button", attributes: {class: "decrease"}, text: "-", events: {
                click: () => {
                    const ability_score = document.getElementById(score)
                    const value = ability_score.getAttribute("value")

                    if (value > 8) {
                        ability_score.setAttribute("value", value - 1)
                        ability_score.textContent = Number(ability_score.textContent) - 1
                    }
                }
            }},
            {tag: "button", attributes: {class: "increase"}, text: "+", events: {
                click: () => {
                    const ability_score = document.getElementById(score)
                    const value = Number(ability_score.getAttribute("value"))

                    if (value < 15) {
                        const cost = value >= 13 ? 2 : 1
                        if (availablePoints() - cost < 0) return

                        ability_score.setAttribute("value", value + 1)
                        ability_score.textContent = Number(ability_score.textContent) + 1
                    }
                }
            }},
        ]}
    }

    // Creating children
    const children = []
    for (const score of ability_scores) children.push(ability_score_box(score))
    
    // Element
    setInterval(updateView, 200)
    return element(
        {tag: "div", attributes: {id: "point-buy-calculator"}, children: [
            {tag: "h4", children: [
                {tag: "span", text: "Available Points: "},
                {tag: "span", attributes: {id: "point-buy-points"}, text: "15"}
            ]},
            {tag: "div", attributes: {class: "spacer"}},
            {tag: "div", attributes: {class: "score-container"}, children: children}
        ]}
    )
}

function mask_point_buy_calculator(mask) {
    for (const score of ["strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma"]) {
        const ability_score = document.getElementById(score)
        const value = Number(ability_score.getAttribute("value"))

        ability_score.textContent = value + Number(mask[score] || 0)
        document.getElementById("point-buy-calculator").dispatchEvent(new Event("mousedown"))
    }
}

//=====================================================================================================

`']`