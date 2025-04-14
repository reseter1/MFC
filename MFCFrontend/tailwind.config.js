module.exports = {
  theme: {
    extend: {
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-in-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in-out forwards',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(100%)', opacity: 0 },
        },
      },
    },
  },
  // các cấu hình khác của bạn...
} 