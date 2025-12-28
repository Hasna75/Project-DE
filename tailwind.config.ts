import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F4E78',
        secondary: '#4472C4',
        accent: '#5B9BD5',
        success: '#70AD47',
        warning: '#FFC000',
        danger: '#C00000',
      },
    },
  },
  plugins: [],
}
export default config

