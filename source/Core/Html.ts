import React from "react"

type Tag = "div" | "button" | "input" | "section" | "nav" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "form"

type Attributes = Record<string, string>

export type Html = [Tag, Attributes, ...Html[]] | string

export const toReact = (html: Html): React.ReactElement => {
    if (typeof html === 'string') {
        return React.createElement("", {})
    }

    const [tag, attributes, ...children] = html

    return React.createElement(tag, attributes, ...children.map(toReact))
}


// 
// 
// 
// 

export const view = (model: { count: number }): Html =>
    ['div', {},
        ['h1', {}, "Login"],
        ['input', { type: "email" }],
        ['button', { class: "btn" }, "Increment"],
        ['h1', { class: "text-bold" }, String(model.count)],
        ['button', { class: "btn" }, "Decrement"]]