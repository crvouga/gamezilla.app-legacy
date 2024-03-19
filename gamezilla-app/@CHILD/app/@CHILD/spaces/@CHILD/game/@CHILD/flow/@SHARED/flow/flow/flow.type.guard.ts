/*
 * Generated type guards for "flow.type.ts".
 * WARNING: Do not manually change this file.
 */
import { Model } from "./flow.type";

export function isModel(obj: unknown): obj is Model {
    const typedObj = obj as Model
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["Flow"] === true &&
        (typedObj["nodes"] !== null &&
            typeof typedObj["nodes"] === "object" ||
            typeof typedObj["nodes"] === "function") &&
        Object.entries<any>(typedObj["nodes"])
            .every(([key, value]) => ((value !== null &&
                typeof value === "object" ||
                typeof value === "function") &&
                typeof value["nodeId"] === "string" &&
                typeof key === "string")) &&
        (typedObj["edges"] !== null &&
            typeof typedObj["edges"] === "object" ||
            typeof typedObj["edges"] === "function") &&
        Object.entries<any>(typedObj["edges"])
            .every(([key, value]) => ((value !== null &&
                typeof value === "object" ||
                typeof value === "function") &&
                typeof value["sourceId"] === "string" &&
                typeof value["targetId"] === "string" &&
                typeof key === "string")) &&
        (typeof typedObj["edgeHash"] === "string" ||
            typeof typedObj["edgeHash"] === "number") &&
        (typedObj["terminalsByGroupId"] !== null &&
            typeof typedObj["terminalsByGroupId"] === "object" ||
            typeof typedObj["terminalsByGroupId"] === "function") &&
        (typeof typedObj["terminalsByGroupId"]["A"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["A"] !== null &&
                typeof typedObj["terminalsByGroupId"]["A"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["A"] === "function") &&
            (typedObj["terminalsByGroupId"]["A"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["A"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["A"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["A"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["A"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["A"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["B"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["B"] !== null &&
                typeof typedObj["terminalsByGroupId"]["B"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["B"] === "function") &&
            (typedObj["terminalsByGroupId"]["B"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["B"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["B"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["B"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["B"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["B"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["C"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["C"] !== null &&
                typeof typedObj["terminalsByGroupId"]["C"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["C"] === "function") &&
            (typedObj["terminalsByGroupId"]["C"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["C"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["C"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["C"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["C"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["C"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["D"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["D"] !== null &&
                typeof typedObj["terminalsByGroupId"]["D"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["D"] === "function") &&
            (typedObj["terminalsByGroupId"]["D"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["D"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["D"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["D"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["D"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["D"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["E"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["E"] !== null &&
                typeof typedObj["terminalsByGroupId"]["E"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["E"] === "function") &&
            (typedObj["terminalsByGroupId"]["E"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["E"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["E"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["E"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["E"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["E"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["F"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["F"] !== null &&
                typeof typedObj["terminalsByGroupId"]["F"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["F"] === "function") &&
            (typedObj["terminalsByGroupId"]["F"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["F"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["F"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["F"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["F"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["F"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["G"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["G"] !== null &&
                typeof typedObj["terminalsByGroupId"]["G"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["G"] === "function") &&
            (typedObj["terminalsByGroupId"]["G"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["G"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["G"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["G"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["G"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["G"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["H"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["H"] !== null &&
                typeof typedObj["terminalsByGroupId"]["H"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["H"] === "function") &&
            (typedObj["terminalsByGroupId"]["H"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["H"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["H"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["H"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["H"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["H"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["I"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["I"] !== null &&
                typeof typedObj["terminalsByGroupId"]["I"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["I"] === "function") &&
            (typedObj["terminalsByGroupId"]["I"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["I"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["I"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["I"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["I"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["I"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["J"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["J"] !== null &&
                typeof typedObj["terminalsByGroupId"]["J"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["J"] === "function") &&
            (typedObj["terminalsByGroupId"]["J"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["J"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["J"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["J"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["J"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["J"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["K"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["K"] !== null &&
                typeof typedObj["terminalsByGroupId"]["K"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["K"] === "function") &&
            (typedObj["terminalsByGroupId"]["K"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["K"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["K"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["K"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["K"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["K"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["L"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["L"] !== null &&
                typeof typedObj["terminalsByGroupId"]["L"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["L"] === "function") &&
            (typedObj["terminalsByGroupId"]["L"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["L"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["L"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["L"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["L"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["L"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["M"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["M"] !== null &&
                typeof typedObj["terminalsByGroupId"]["M"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["M"] === "function") &&
            (typedObj["terminalsByGroupId"]["M"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["M"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["M"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["M"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["M"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["M"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["N"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["N"] !== null &&
                typeof typedObj["terminalsByGroupId"]["N"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["N"] === "function") &&
            (typedObj["terminalsByGroupId"]["N"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["N"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["N"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["N"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["N"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["N"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["O"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["O"] !== null &&
                typeof typedObj["terminalsByGroupId"]["O"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["O"] === "function") &&
            (typedObj["terminalsByGroupId"]["O"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["O"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["O"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["O"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["O"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["O"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["P"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["P"] !== null &&
                typeof typedObj["terminalsByGroupId"]["P"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["P"] === "function") &&
            (typedObj["terminalsByGroupId"]["P"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["P"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["P"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["P"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["P"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["P"]["endId"] === "string")) &&
        (typeof typedObj["terminalsByGroupId"]["Q"] === "undefined" ||
            (typedObj["terminalsByGroupId"]["Q"] !== null &&
                typeof typedObj["terminalsByGroupId"]["Q"] === "object" ||
                typeof typedObj["terminalsByGroupId"]["Q"] === "function") &&
            (typedObj["terminalsByGroupId"]["Q"]["groupId"] === "A" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "B" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "C" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "D" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "E" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "F" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "G" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "H" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "I" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "J" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "K" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "L" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "M" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "N" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "O" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "P" ||
                typedObj["terminalsByGroupId"]["Q"]["groupId"] === "Q") &&
            typeof typedObj["terminalsByGroupId"]["Q"]["startId"] === "string" &&
            (typeof typedObj["terminalsByGroupId"]["Q"]["endId"] === "undefined" ||
                typedObj["terminalsByGroupId"]["Q"]["endId"] === null ||
                typeof typedObj["terminalsByGroupId"]["Q"]["endId"] === "string")) &&
        (typedObj["pipesBySourceId"] !== null &&
            typeof typedObj["pipesBySourceId"] === "object" ||
            typeof typedObj["pipesBySourceId"] === "function") &&
        Object.entries<any>(typedObj["pipesBySourceId"])
            .every(([key, value]) => ((value !== null &&
                typeof value === "object" ||
                typeof value === "function") &&
                (value["groupId"] === "A" ||
                    value["groupId"] === "B" ||
                    value["groupId"] === "C" ||
                    value["groupId"] === "D" ||
                    value["groupId"] === "E" ||
                    value["groupId"] === "F" ||
                    value["groupId"] === "G" ||
                    value["groupId"] === "H" ||
                    value["groupId"] === "I" ||
                    value["groupId"] === "J" ||
                    value["groupId"] === "K" ||
                    value["groupId"] === "L" ||
                    value["groupId"] === "M" ||
                    value["groupId"] === "N" ||
                    value["groupId"] === "O" ||
                    value["groupId"] === "P" ||
                    value["groupId"] === "Q") &&
                typeof value["edgeId"] === "string" &&
                typeof key === "string"))
    )
}
