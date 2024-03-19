function darkenHex(hex: string, percent: number): string {
    // Convert the hex color to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    // Darken the color by the percent value
    r = Math.round(r * (1 - percent));
    g = Math.round(g * (1 - percent));
    b = Math.round(b * (1 - percent));
    // Convert the RGB color back to hex
    const newHex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return newHex;
}
export const Hex = {
    darken: darkenHex,
};
