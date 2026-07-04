const jsdom = require("jsdom");
const { JSDOM } = jsdom;

JSDOM.fromURL("https://artistant.in", {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
}).then(dom => {
  setTimeout(() => {
    // Give React time to render
    const text = dom.window.document.body.textContent;
    // Format the text by replacing multiple newlines and spaces
    const cleanText = text.replace(/\s+/g, ' ').trim();
    console.log("RENDERED TEXT:");
    console.log(cleanText);
    
    // Also try to find all image srcs or headings
    const headings = Array.from(dom.window.document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(h => h.textContent);
    console.log("HEADINGS:");
    console.log(headings.join('\n'));
  }, 2000);
}).catch(e => console.error(e));
