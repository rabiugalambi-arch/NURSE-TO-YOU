const fs = require('fs');
let block = fs.readFileSync('results.txt', 'utf8');

let open = (block.match(/<div/g) || []).length;
let close = (block.match(/<\/div/g) || []).length;

console.log('Open divs:', open);
console.log('Close divs:', close);
