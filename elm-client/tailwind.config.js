const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },
    experimental: {
        darkModeVariant: true,
    },
    dark: "media",
    purge: ["src/app/**/*.elm"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter var", ...defaultTheme.fontFamily.sans],
            },
        },
    },
    variants: {
        textColor: ({ after }) => after(["disabled"]),
        pointerEvents: ({ after }) => after(["disabled"]),
        margin: ({ after }) => after(["first"]),
        fontWeight: ({ after }) => after(["dark"]),
    },
    plugins: [require("@tailwindcss/ui")],
};
