const fs = require('fs');
const { parse } = require('svgson');
const svgPathParser = require('svg-path-parser');

// Path to your SVG file
const svgFilePath = './cursive-vector-banner.svg'; // Replace with your SVG file path

// Read the SVG file
fs.readFile(svgFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading SVG file:', err);
    return;
  }

  // Parse the SVG content
  parse(data).then((svgJson) => {
    // Find all <path> elements
    const paths = [];
    const traverse = (node) => {
      if (node.name === 'path') {
        const d = node.attributes.d;
        if (d) {
          paths.push(d);
        }
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(svgJson);

    if (paths.length === 0) {
      console.error('No <path> elements found in SVG.');
      return;
    }

    // For simplicity, assume there's only one path
    const pathDataString = paths.join(' '); // Join all paths if multiple

    // Parse the path data string into commands
    const commands = svgPathParser.parseSVG(pathDataString);

    // Save the commands to a JSON file
    fs.writeFileSync('pathData.json', JSON.stringify(commands, null, 2));

    console.log('Path data has been saved to pathData.json');
  });
});
