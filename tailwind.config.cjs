module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
        primaryDark: '#15803d',
        heading: '#111827',
        body: '#6b7280',
        sub: '#4b5563',
        alt: '#f9fafb',
        cardBorder: '#e5e7eb'
      },
      fontFamily: {
        figtree: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        satoshi: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl: '28px'
      },
      boxShadow: {
        card: '0px 4px 4px rgba(205,205,205,0.32)'
      }
    }
  },
  plugins: []
};
