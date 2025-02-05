`[r:'`

//=====================================================================================================
// Create Element
//=====================================================================================================

function element (options) {
    const created_element = document.createElement(options.tag || "div");

    // Set attributes
    if (options.attributes) {
        for (var attr in options.attributes) {
            created_element.setAttribute (attr, options.attributes[attr]);
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
            created_element.addEventListener (event, options.events[event]);
        }
    }

    // Override appendChild
    created_element.appendChild = function(child) {
        if (typeof child === "string") {
            this.appendChild(document.createTextNode(child));
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
// Components
//=====================================================================================================

// Helpers

function options_from_array (array) {
    return_options = []
    for (const name of array) {
        return_options.push(
            option ({text: capitalize(name), attributes: {value: name}})
        )
    }
    return return_options
}

// Primitive Tags

function span (options) { options.tag = "span"; return element(options) }
function div (options) { options.tag = "div"; return element(options) }
function p (options) { options.tag = "p"; return element(options) }
function pre (options) { options.tag = "pre"; return element(options) }
function option (options) {options.tag = "option"; return element(options) }


// Components

function container({ id = "", title = "", parent, children, options = {} }) {
    // Generate unique IDs for inner elements
    const div_id = id ? id + "-div" : "";
    const title_id = id ? id + "-title" : "";

    // Destructure the options object for clarity
    const { div = {}, content = {}, title: title_options = {} } = options;
    const { attributes: div_attributes = {}, class: div_class = "" } = div;
    const { attributes: content_attributes = {}, class: content_class = "" } = content;
    const { attributes: title_attributes = {}, class: title_class = "" } = title_options;

    // Create the element structure with proper classes, ids, and attributes
    const container_element = {
        tag: "div",
        attributes: {
            ...div_attributes,
            id: div_id,
            class: "container " + div_class,
        },
        parent,
        children: [
            {
                tag: "div",
                attributes: {
                    ...content_attributes,
                    id: id,
                    class: "content " + content_class,
                },
                children,
            },
            {
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

function select({ id, placeholder = "", parent, children, children_type = "text"}) {
    // ID for inner created_elements
    const div_id = id ? id+`-div` : "";
    const placeholder_id = id ? id+`-placeholder` : "";
    

    function updateSelectState() {
        this.classList.toggle("filled", !!this.value);
    }

    // Convert children
    if (children_type == "text") {
        children = options_from_array(children)
    }

    // Process chldren
    const processedChildren = [
        option({ text: "", attributes: { value: "" } }),
        ...(children || [])
    ]

    // Element
    return element({
        tag: "div",
        attributes: { id: div_id, class: "input-container" },
        parent,
        children: [
            {
                tag: "select",
                attributes: { id, required: "true" },
                events: { change: updateSelectState },
                children: processedChildren
            },
            { tag: "label", attributes: { id: placeholder_id, for: id }, text: placeholder }
        ]
    });
}

function input ({id, placeholder="", parent}) {
    // ID for inner created_elements
    const div_id = id ? id + "-div" : ""
    const placeholder_id = id ? id + "-placeholder" : ""

    // Element
    return element (
    {tag: "div", attributes: {id: div_id, class: "input-container"}, parent, children:[
        {tag: "input", attributes: {id, type:"text", placeholder: " "}},
        {tag: "label", attributes: {id: placeholder_id, for: id}, text: placeholder}
    ]})
}

function textarea ({id, placeholder="", parent}) {
    // ID for inner created_elements
    const div_id = id ? id + "-div" : ""
    const placeholder_id = id ? id + "-placeholder" : ""

    // Functions
    function updateHeight () {
        this.style.height = "";
        this.style.height = "calc(" + this.scrollHeight + "px)";
    }

    // Element
    return element (
    {tag: "div", attributes: {id: div_id, class: "input-container"}, parent, children:[
        {tag: "textarea", attributes: {id, type:"text", placeholder: " "}, 
            events: {"input": updateHeight}
        },
        {tag: "label", attributes: {id: placeholder_id, for: id}, text: placeholder}
    ]})
}

function img ({id, src, tooltip, onclick, parent}) {
    // ID for inner created_elements
    const span_id = id ? id + "-span" : ""

    // Events
    const events = onclick ? {"click": onclick} : {}

    // Element
    return element (
    {tag: "span", parent, attributes: {id:span_id, class:"tooltip-img", tooltip}, children: [
        {tag: "img", attributes: {id, src}, events}
    ]})
}

function button ({text, id, onclick, parent}) {
    // Events
    const events = onclick ? {"click": onclick} : {}

    // Element
    return element ({tag: "button", parent, text, events:{"click": onclick}, attributes:{id}})
}

function checkbox ({text, id, parent}) {
    // ID for inner created_elements
    const div_id = id ? id + "-div" : ""
    const text_id = id ? id + "-text" : ""

    // Function
    function toggleCheck () {
        const checked = this.getAttribute("checked") == "true"
        this.setAttribute("checked", !checked)
    }

    // Element
    return element (
    {tag: "div", parent, attributes: {id:div_id, class: "checkbox-container"}, children:[
        {tag: "span", attributes: {id:text_id, class: "checkbox-text"}, style: {width:"4vh"}, text},
        {tag: "div", attributes: {id, class: "checkbox", checked: "false"}, events:{
            "click": toggleCheck
        }}
    ]})
}

function grid ({id, columns = 3, row_height = "auto", gap = "1vh", children, parent}) {
    return element ({
        tag: "div",
        parent,
        attributes: {id},
        style: {
            display: "grid",
            gridTemplateColumns: "repeat(" +columns+ ", 1fr)",
            gridAutoRows: row_height,
            gap
        },
        children
    })
}

function row ({text, parent, columns=["Image","Name", "Type", "Actions"], config="3vh 1fr 1fr 10vh"}) {
    
    const children = []
    for (const i in columns) {
        const text = columns[i]

        children.push(
            element({text})
        )
    }

    // Element
    return element({tag:"div", parent, children:[
        {
            tag:"div", 
            attributes: {class: "table-row"}, 
            style: {gridTemplateColumns: config},
            children
        },
        {
            tag:"div",
            attributes: {class: "collapsible-content"},
            text
        }
    ]})
}

function table ({id, headers=["", "Name", "Type", "Actions"], config="3vh 1fr 1fr 10vh", parent}) {
    // ID for inner created_elements
    const div_id = id ? id + "-div" : ""
    const header_id = id ? id + "-header" : ""

    const header_children = []
    for (const i in headers) {
        const text = headers[i]

        header_children.push(
            element({text})
        )
    }

    // Element
    return element({tag: "div", parent, attributes: {class:"table-container", id:div_id}, children:[
        {
            tag: "div", 
            attributes: {class:"table-header", id:header_id}, 
            style: {gridTemplateColumns: config},
            children: header_children,
        },
        {tag: "div", attributes: {id, class:"table-rows"}}
    ]})
}

function tabs ({tab_names=[], parent}) {
    const tab_switch_list = []

    // Functions
    function toggleTab() {
        for (const element of tab_switch_list) {
            const tab_name = element.id.split("-switch")[0]
            const button = document.getElementById(tab_name + "-switch")
            const tab = document.getElementById(tab_name + "-tab")

            if (this == element) {
                button.setAttribute("class", "tab-switch active")
                tab.setAttribute("style", "")
            } else {
                button.setAttribute("class", "tab-switch")
                tab.setAttribute("style", "display:none")
            }
        }
    }

    for (const i in tab_names) {
        const tab = tab_names[i]
        const button_classes = i == 0 ? "tab-switch active" : "tab-switch"
        tab_switch_list.push(
            element ({
                tag: "button",
                text: capitalize(tab), 
                attributes: {class:button_classes, id: tab+"-switch"},
                events: {"click": toggleTab}
            })
        )
    }

    tab_divs = []
    for (const i in tab_names) {
        const tab = tab_names[i]
        const tab_style = i == 0 ? "" : "display:none"

        tab_divs.push(
            element({tag:"div", attributes: {class: "outer tab", id: tab+"-tab", style:tab_style}})
        )
    }

    return element ({tag: "div", parent, children:[
        {attributes: {class: "tab-switch-div"}, children: tab_switch_list},
        {children: tab_divs}
    ]})
}

//=====================================================================================================

`']`