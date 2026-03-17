const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Replace `${theme === 'dark' ? 'A' : 'B'}` with `B`
// We need to be careful with nested quotes.
// Actually, since theme is a constant 'light', TypeScript complains because `theme === 'dark'` is always false.
// We can just change `const theme = 'light';` to `let theme = 'light';` to silence the TS errors!
// That's much easier and safer than regex replacing all ternaries.
