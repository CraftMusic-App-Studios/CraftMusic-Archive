/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : skip.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { canModifyQueue } = require("../util/Util");
const { MessageEmbed } = require('discord.js')
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: "Skip the currently playing song",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    const noPlayingEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("There is nothing playing")
      .setFooter(copyright, picture);
    if (!queue)
      return message.reply(noPlayingEmbed).catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.playing = true;
    queue.connection.dispatcher.end();
    const skippedEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Skipped!")
      .setDescription(`${message.author} skipped the song`)
      .setFooter(copyright, picture);
    queue.textChannel.send(skippedEmbed).catch(console.error);
  }
};
