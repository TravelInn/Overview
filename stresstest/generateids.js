const fs = require('fs');

const generateIds = () => {
  let toWriteTo = '';
  toWriteTo += "id";
  toWriteTo += "\n";
    for (let i = 0; i < 1000000; i++) {
    //hit last 10% end of database
    toWriteTo += i + 1 + 8000000;
    toWriteTo += "\n";
  }
  try {
    fs.writeFileSync('./stresstest/ids.csv', toWriteTo);
  } catch (err) {
    console.log('Error: ', err);
  }   
}

generateIds();