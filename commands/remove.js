/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : remove.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { canModifyQueue } = require("../util/Util");
const { MessageEmbed } = require('discord.js');
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

// ======================================================================== //

// ======================================================================== //

module.exports = {
  name: "remove",
  aliases: ["rm"],
  description: "Remove song from the queue",
  execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);
    const noPlayingEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("There is nothing playing")
      .setFooter(copyright, picture);
    if (!queue) return message.channel.send(noPlayingEmbed).catch(console.error);
    if (!canModifyQueue(message.member)) return;
    const usageEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription(`Usage: ${message.client.prefix}remove <Queue Number>`)
      .setFooter(copyright, picture);

    if (!args.length) return message.reply(usageEmbed);
    if (isNaN(args[0])) return message.reply(usageEmbed);

    const song = queue.songs.splice(args[0] - 1, 1);
    const removedEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Removed!")
      .setDescription(`${message.author} removed **${song[0].title}** from the queue.`)
      .setFooter(copyright, picture);

    queue.textChannel.send(removedEmbed);
  }
};
