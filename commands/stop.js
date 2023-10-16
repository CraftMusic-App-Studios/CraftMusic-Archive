/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : stop.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { canModifyQueue } = require("../util/Util");
const { MessageEmbed } = require('discord.js')
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

module.exports = {
  name: "stop",
  description: "Stops the music",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);

    const noPlayingEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("There is nothing playing")
      .setFooter(copyright, picture);

    if (!queue) return message.reply(noPlayingEmbed).catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.songs = [];
    queue.connection.dispatcher.end();
    const stoppedEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Stopped!")
      .setDescription(`${message.author} stopped the music!`)
      .setFooter(copyright, picture);
    queue.textChannel.send(stoppedEmbed).catch(console.error);
  }
};
