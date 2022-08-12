
const fs = require('fs')
const allWallet = ""

const arr = []
let xx = 0
for(let i=0; i < allWallet.length;i++) {
    if(allWallet[i]== "\n") {
        const aa = allWallet.slice(xx,i)
        arr.push(aa)
        xx = i+1
    }
}


fs.writeFile("datas.txt", JSON.stringify(arr), (err) => {
      if (err)
          console.log(err);
      else {
          console.log("File written successfully\n");
      }
  });