const opentype = require('opentype.js');
const fs = require('fs');

const fontPath = './fonts/PlaywriteDEVA-VariableFont_wght.ttf'; // Adjust the path to your font file

opentype.load(fontPath, (err, font) => {
  if (err) {
    console.error('Could not load font: ' + err);
  } else {
    const text = 'applesaucelabs';
    const fontSize = 150;
    const x = 0;
    const y = 0;

    // Get the path of the text
    const path = font.getPath(text, x, y, fontSize);

    // Convert the path commands to a JSON-friendly format
    const pathData = path.commands;

    // Save the path data to a JSON file
    fs.writeFileSync('pathData.json', JSON.stringify(pathData, null, 2));

    console.log('Path data saved to pathData.json');
  }
});
