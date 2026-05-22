const fs = require('fs');
let code = fs.readFileSync('UrbanSketcher.jsx', 'utf8');

// Replace escaped backticks
code = code.replace(/\\`/g, '`');

// Replace escaped dollar signs
code = code.replace(/\\\$/g, '$');

// Replace double backslash n with single backslash n
code = code.replace(/\\\\n/g, '\\n');

fs.writeFileSync('UrbanSketcher.jsx', code);
console.log('Fixed UrbanSketcher.jsx syntax errors');
