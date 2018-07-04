const fs = require('fs');

const generateIds = () => {
  let toWriteTo = '';
  toWriteTo += "id";
  toWriteTo += "\n";
    for (let i = 0; i < 900000; i++) {
    //generate one side of power curve - 10% of results represent 90% of hits
      toWriteTo += Math.floor(Math.random() * 100000) + 1 + 9000000;
      toWriteTo += "\n";
    }
    for (let i = 0; i < 100000; i++) {
    //generate other side of power curve - 90% of results represent 10% of hits
      toWriteTo += Math.floor(Math.random() * 900000) + 1 + 9100000;
      toWriteTo += "\n";
    }
    //this assumes artillery hits ids randomly
    //90% of IDs will be within 10% of range and vice versa
  try {
    fs.writeFileSync('./stresstest/ids.csv', toWriteTo);
  } catch (err) {
    console.log('Error: ', err);
  }   
}

generateIds();