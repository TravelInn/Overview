const fs = require('fs');

const generateIds = () => {
  let toWriteTo = '';
  toWriteTo += "id";
  toWriteTo += "\n";
    for (let i = 0; i < 100000; i++) {
    //hit last 10% end of database
    toWriteTo += Math.floor(Math.random() * 1000000) + 8000000 + 1;
    toWriteTo += "\n";
  }
  try {
    fs.writeFileSync('./stresstest/ids.csv', toWriteTo);
  } catch (err) {
    console.log('Error: ', err);
  }   
}

generateIds();