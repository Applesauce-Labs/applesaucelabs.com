const pathData = require('./pathData.json');

pathData.forEach((cmd, index) => {
  if (cmd.code.toUpperCase() === 'C') {
    const requiredProps = ['x1', 'y1', 'x2', 'y2', 'x', 'y'];
    requiredProps.forEach((prop) => {
      if (cmd[prop] === undefined) {
        console.error(`Missing property '${prop}' in command at index ${index}:`, cmd);
      }
    });
  }
});
