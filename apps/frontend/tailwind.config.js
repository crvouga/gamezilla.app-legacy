const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    aspectRatio: false, //<- this prevents conflict with @tailwindcss/aspect-ratio
  },
  plugins: [require('daisyui'), require('@tailwindcss/aspect-ratio')],
  daisyui: {
    themes: [
      {
        myTheme: {
          primary: '#3b82f6',

          secondary: '#3b82f6',

          accent: '#c026d3',

          neutral: '#f5f5f4',

          'base-100': '#000',

          info: '#11B3EE',

          success: '#84cc16',

          warning: '#facc15',

          error: '#dc2626',
        },
      },
    ],
  },
};
