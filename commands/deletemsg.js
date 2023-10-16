/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : deletemsg.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"
let config;

try {
  config = require("../config.json");
} catch (error) {
  config = null;
}

module.exports = {
  name: "deletemsg",
  description: "Toggle pruning of bot messages",
  execute(message) {
    if (!config) return;
    config.PRUNING = !config.PRUNING;

    fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.log(err);
        const noWritingFileEmbed = new MessageEmbed()
          .setTitle("Error!")
          .setColor("#6200FF")
          .setDescription("There was an error writing to the file.")
          .setFooter(copyright, picture);
        return message.channel.send(noWritingFileEmbed).catch(console.error);
      }

      return message.channel
        .send(`Message pruning is ${config.PRUNING ? "**enabled**" : "**disabled**"}`)
        .catch(console.error);
    });
  }
};
