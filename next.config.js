const withTM = require('next-transpile-modules')(['markdown-table'])

module.exports = withTM({
  rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ]
  },
})
