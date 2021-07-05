// var date = new Date("08/01/2021 07:00:00");
// var milliseconds = date.getTime();
// console.log(milliseconds);
let parse = require('url-parse');
let text = 'https://m.facebook.com/tuananhdeptrai.95'
let checkFacebook = null
async function hello() {
    checkFacebook = await parse(text, true)
    console.log(checkFacebook.hostname)
}
hello()