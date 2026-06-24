tailwind.config = {
  theme: {
    extend: {
      colors: {
        obsidian: '#0F1115',
        charcoal: '#2B2F36',
        slategray: '#5B6777',
        steelgray: '#6E7681',
        cloudwhite: '#FFFFFF',
        softwhite: '#F4F4F4',
        patriot: '#0D3B8E',
        'patriot-light': '#1E56B8',
        'patriot-dark': '#082a66',
        accent: '#C8102E',
        'accent-dark': '#9c0c23',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'brand-sm': '0 2px 10px -2px rgba(13,59,142,0.25), 0 1px 3px rgba(15,17,21,0.5)',
        'brand-md': '0 16px 32px -12px rgba(13,59,142,0.35), 0 4px 10px -2px rgba(15,17,21,0.55)',
        'brand-lg': '0 30px 60px -15px rgba(15,17,21,0.6), 0 10px 20px -6px rgba(13,59,142,0.3)',
        'accent-sm': '0 6px 18px -4px rgba(200,16,46,0.45)',
      },
    },
  },
};
