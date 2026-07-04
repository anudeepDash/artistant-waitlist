const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\anude\\.gemini\\antigravity\\brain\\a57b32f5-eba3-4f12-88e5-37d0078a8054\\.system_generated\\steps\\465\\content.md', 'utf8');

// Extract typical text nodes in React which look like `"Some text here"` or appear in arrays
const matches = content.match(/"([^"]{15,100})"/g);
if (matches) {
    // Filter out common JS code strings, css classes, html tags
    const clean = matches
        .map(s => s.replace(/"/g, ''))
        .filter(s => 
            !s.includes('<') && 
            !s.includes('function') &&
            !s.includes('{') &&
            !s.includes('://') &&
            !s.includes('.js') &&
            !s.includes('.css') &&
            !s.match(/^[a-z0-9_-]+$/i) // ignore pure alphanumeric/classnames
        );
    
    console.log([...new Set(clean)].slice(0, 50).join('\n'));
}
