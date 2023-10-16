/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : resume.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { canModifyQueue } = require("../util/Util");
const { MessageEmbed } = require('discord.js');
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

module.exports = {
  name: "resume",
  aliases: ["r"],
  description: "Resume currently playing music",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    const noPlayingEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("There is nothing playing")
      .setFooter(copyright, picture);
    if (!queue) return message.reply(noPlayingEmbed).catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (!queue.playing) {
      queue.playing = true;
      queue.connection.dispatcher.resume();
      const resumedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Resumed!")
        .setDescription(`${message.author} resumed the music!`)
        .setFooter(copyright, picture);
      return queue.textChannel.send(resumedEmbed).catch(console.error);
    }

    const notPausedEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("The queue is not paused.")
      .setFooter(copyright, picture);
    return message.reply(notPausedEmbed).catch(console.error);
  }
};
