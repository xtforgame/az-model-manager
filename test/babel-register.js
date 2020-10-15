require('@babel/polyfill');
module.exports = require('@babel/register')({ extensions: ['.js', '.ts'] });
