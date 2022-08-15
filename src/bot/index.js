const TelegramBot = require("node-telegram-bot-api");
const { Canvas, Image } = require("canvas");
const mergeImages = require("merge-images");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");
const { getMeta } = require("../lib/getSizeOfImage.js");
const { MESSAGE } = require("./enum.js")
const resizeImg = require ("resize-img")

const OPTION = {
  YES: "yes",
  NO: "no",
};


module.exports =  function TeleBot() {
  const token = process.env.TOKEN;
  const bot = new TelegramBot(token, { polling: true, filepath: false });

  bot.on("message", async (msg) => {
    let chatId = msg.chat.id;
    const directory = `static/${chatId}`
    const caption = {
      caption:
        MESSAGE.CHOOSE_FRAME,
    };

    const media = [
      {
        type: "photo",
        media:
          "https://png.pngtree.com/png-clipart/20210702/ourlarge/pngtree-gold-plated-photo-frame-design-png-image_3542960.jpg",
        ...caption,
      },
      {
        type: "photo",
        media:
          "https://png.pngtree.com/png-vector/20200428/ourlarge/pngtree-elegent-rectangle-golden-picture-and-photo-frame-vector-png-image_2195345.jpg",
      },
      {
        type: "photo",
        media:
          "https://khungtranhre.com/wp-content/uploads/2020/08/khung-anh-png-19.jpg",
      },
      {
        type: "photo",
        media:
          "https://i.pinimg.com/originals/95/e1/06/95e10601f0521ec7c455f464e48c68dc.png",
      },
      {
        type: "photo",
        media:
          "https://png.pngtree.com/png-clipart/20190119/ourlarge/pngtree-vintage-old-time-photo-frame-vintage-paper-old-yellow-vintage-background-png-image_468660.jpg",
      },
    ];

    if (msg.photo) {
      try {
        const file_id = msg.photo[msg.photo.length - 1].file_id;
        const link = await bot.getFileLink(file_id);
        const response = await axios({
          url: link,
          method: "GET",
          responseType: "stream",
        });

        const Path = path.resolve(__dirname, `../../${directory}`)
        if (!fs.existsSync(Path)) {
          fs.mkdirSync(directory)
        }
        const writer = fs.createWriteStream(Path + "/image.png");
        response.data.pipe(writer);
        bot.sendMediaGroup(chatId, media);
      } catch (error) {
        bot.sendMessage(chatId, MESSAGE.ERROR)
      }
    } else if (!isNaN(parseInt(msg.text))) {
      const index = parseInt(msg.text);
      const frame = media[index - 1];
      if (!frame)
        bot.sendMessage(chatId, MESSAGE.FRAME_NOT_FOUND);
      else {
        const img1 = frame.media;
        try {
          const metaData = await getMeta(img1);
          const frame_data = {
            x: metaData.width,
            y: metaData.height,
          };
          const Path = path.resolve(__dirname, `../../${directory}`, "image.png");
          if (fs.existsSync(Path)) {
            const img2 = fs.readFileSync(Path)
            const dimensions2 = sizeOf(Path);
            const photo_data = {
              x: dimensions2.width,
              y: dimensions2.height,
            };
            let b64
            if(frame_data.x> photo_data.x && frame_data.y> photo_data.y){
              b64=await mergeImages(
                [
                  {
                    src: img1,
                  },
                  {
                    src: img2,
                    x: frame_data.x / 2 - photo_data.x / 2,
                    y: frame_data.y / 2 - photo_data.y / 2,
                  },
                ],
                {
                  Canvas: Canvas,
                  Image: Image,
                }
              )
            }else{
              const resizeWidth = frame_data.x*0.8
              const resizeHeight = frame_data.y*0.8
              const resize_Image=await resizeImg(img2,{
                width:resizeWidth,
                height:resizeHeight
              })
              b64=await mergeImages(
                [
                  {
                    src: img1,
                  },
                  {
                    src: resize_Image,
                    x: frame_data.x / 2 - resizeWidth/ 2,
                    y: frame_data.y / 2 - resizeHeight / 2,
                  },
                ],
                {
                  Canvas: Canvas,
                  Image: Image,
                }
              )
            }
            const file_option = {
              filename: "merge image",
              contentType: "image/jpg",
            };
            bot.sendPhoto(
              chatId,
              Buffer.from(b64.substr(21), "base64"),
              file_option
            );
            bot.sendMessage(chatId, MESSAGE.WH_QUESTION);

          } else {
            bot.sendMessage(chatId, MESSAGE.PICTURE_NOT_FOUND);
          }
        } catch (error) {
          bot.sendMessage(chatId, MESSAGE.ERROR)
        }
      }
    } else {
      try {
        if (msg.text.toString().toLocaleLowerCase().includes(OPTION.YES)) {
          const Path = path.resolve(__dirname, `../../${directory}`, "image.png");
          if (fs.existsSync(Path)) {
            fs.unlinkSync(Path)
            fs.rmdirSync(directory)
          }
        } else if (msg.text.toString().toLocaleLowerCase().includes(OPTION.NO)) {
          bot.sendMediaGroup(chatId, media);
        } else {
          bot.sendMessage(chatId, MESSAGE.POST_PHOTO);
        }
      } catch (error) {
        bot.sendMessage(chatId, MESSAGE.ERROR)
      }
    }
  });
}

