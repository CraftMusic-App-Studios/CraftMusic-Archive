/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : move.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const move = require("array-move");
const { canModifyQueue } = require("../util/Util");
const { MessageEmbed, Message } = require("discord.js");
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

// ==============================---{ Embeds }---============================== //

// ==============================---{ Embeds }---============================== //

module.exports = {
  name: "move",
  aliases: ["mv"],
  description: "Move songs around in the queue",
  execute(message, args) {
    const usageEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription(`Usage: ${message.client.prefix}move <Queue Number>`)
      .setFooter(copyright, picture);
    const queue = message.client.queue.get(message.guild.id);
    const noPlayingEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("There is nothing playing")
      .setFooter(copyright, picture);
    if (!queue) return message.channel.send(noPlayingEmbed).catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (!args.length) return message.reply(usageEmbed);
    if (isNaN(args[0]) || args[0] <= 1) return message.reply(usageEmbed);

    let song = queue.songs[args[0] - 1];

    queue.songs = move(queue.songs, args[0] - 1, args[1] == 1 ? 1 : args[1] - 1);
    const movedEmbed = new MessageEmbed()
    .setColor("#6200FF")
    .setTitle("Moved!")
    .setDescription(`${message.author} moved **${song.title}** to ${args[1] == 1 ? 1 : args[1] - 1} in the queue.`)
    .setFooter(copyright, picture);
    queue.textChannel.send(movedEmbed);
  }
};
