


// // const sgMail = require('@sendgrid/mail')
// // sgMail.setApiKey("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") //mail

// const { resolve } = require("tinyurl");

// // const msg = {
// //     to: 'thanhdatppro@gmail.com', // Change to your recipient
// //     from: 'admin@airdrop.conin.ai', // Change to your verified sender
// //     subject: 'Sending with SendGrid is Fun',
// //     text: 'and easy to do anywhere, even with Node.js',
// //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// // }
// // sgMail
// //     .send(msg)
// //     .then(() => {
// //         console.log('Email sent')
// //     })
// //     .catch((error) => {
// //         console.error(error)
// //         console.error(error.response.body)
// //     })


// // var nodemailer = require("nodemailer");

// // async function main() {
// //     let transporter = nodemailer.createTransport({
// //         host: "mail.smtp2go.com",port: 587,secure: false, 
// //         auth: {
// //             user: "zo", // generated ethereal user
// //             pass: "cTU2cjVkNmRwbjAw", // generated ethereal password
// //             // user: "AKIARM5645MV2MGGLT6D", // generated ethereal user
// //             // pass: "BGruOS0EnRc3xZ00Y7MXndjqKpXp3Q8NREXzcfkeY4Zw", // generated ethereal password
// //         },
// //     });

// //     let info = await transporter.sendMail({

// //         from: 'Conin Airdrop Verify <no_reply@airdrop.conin.ai>',
// //         to: "patrickvie98@gmail.com", // list of receivers
// //         subject: "Hello ✔", // Subject line
// //         html: "<b>Hello world?</b>", 
// //     });
// //     console.log("Message sent: %s", info.messageId);
// // }
// // async function main() {
// //     let transporter = nodemailer.createTransport({
// //         host: "in-v3.mailjet.com", port: 587, secure: false,
// //         auth: {
// //             // user: "patrickvie98@gmail.com", // generated ethereal user
// //             // pass: "mTZDpHOY7UJcQxBL", // generated ethereal password
// //             user: "3a8bb8f1f188dbd4cc59d2c138b87c00", // generated ethereal user
// //             pass: "364f4bd60798d49c62e97fdbd8fdf0b6", // generated ethereal password
// //             // user: "AKIARM5645MV2MGGLT6D", // generated ethereal user
// //             // pass: "BGruOS0EnRc3xZ00Y7MXndjqKpXp3Q8NREXzcfkeY4Zw", // generated ethereal password
// //         },
// //     });

// //     let info = await transporter.sendMail({

// //         from: 'Conin Airdrop Verify <no_reply@jet.conin.ai>',
// //         to: "patrickvie98@gmail.com", // list of receivers
// //         subject: "Hello ✔", // Subject line
// //         html: "<b>Hello world?</b>",
// //     });
// //     console.log("Message sent: %s", info.messageId);
// // }

// // main().catch(console.error);

// let count = 0;
// let countb = 0;


// let fakeDB = [];
// let sent = new Set();

// ((num) => {
//     for (let i = 0; i < num; i++) {
//         let ranId = Math.round(Math.random() * (99999999 - 10000000) + 10000000);
//         // console.log("ranId", ranId);
//         sent.add(ranId);

//         fakeDB.push(ranId)
//     }
// })(10)



// // console.log(fakeDB);



// let moment = require("moment");

// let sendMessageAsync = async (id) => {

//     console.log(" start send to ", id, " at", new moment().format("HH:MM:ss:SS"));
//     sent.delete(id);
//     console.log(sent);
//     setTimeout(() => {
//         console.log("sent to", id, new moment().format("HH:MM:ss:SS"));
//     }, 300)
// }

// let countid = 0;
// // let send = setInterval(async () => {

// //     sendMessageAsync(fakeDB[countid]);
// //     ++countid;
// //     if (countid > fakeDB.length - 1) clearInterval(send)

// // }, 3)

// let z = new Set([1, 3, 4, 5, 3]);
// for (let i = 0; i < 10; i++) {
//     z.add(i);
// }

// console.log(z);



// while (z.size !== 0) {
//     let z_iterator = z.values();
//     let id = z_iterator.next().value;
//     z.delete(id);
//     console.log(id, z);
//     console.log();
// }


// console.log(z.values().next());



let a = {
    "keyboard": [1,2,32,332]
}


let b = {
    reply:a
}


console.log(b);