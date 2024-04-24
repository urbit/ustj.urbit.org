/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1900px",
    },
    extend: {
      fontFamily: {
        sans: ["Urbit Sans"],
        mono: ["Urbit Sans", { fontVariationSettings: '"xtab" 500' }],
        serif: ["Urbit Serif Italic"],
      },
      fontSize: {
        base: ["1rem", { lineHeight: "1.34", letterSpacing: "0.024em" }], // 16px, 21.44px
        lg: ["1.125rem", { lineHeight: "1.34", letterSpacing: "0.024em" }], // 18px, 24.12px
        xl: ["1.3125rem", { lineHeight: "1.3", letterSpacing: "0.024em" }], // 21px, 27.3px
        "2xl": ["1.5rem", { lineHeight: "1.25", letterSpacing: "0.024em" }], // 24px, 30px
        "3xl": ["1.875rem", "1.1"], // 30px, 33px
        "4xl": ["2.25rem", "1.1"], // 36px, 39.6px
        "5xl": ["3rem", "1.1"], // 48px, 52.8px
        "6xl": ["3.75rem", "1.1"], // 60px, 66px
        "7xl": ["5rem", "1.1"], // 80px, 88px
        "8xl": ["6.25rem", "1.1"], // 100px, 110px
        "9xl": ["7.5rem", "1.1"], // 120px, 132px
      },
      colors: {
        black: "var(--black)",
        white: "var(--white)",
        primary: "var(--primary)",
        muted: "var(--muted)",
      },
    },
  },
};
