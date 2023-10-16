/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : shuffle.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { canModifyQueue } = require("../util/Util");
const { MessageEmbed } = require('discord.js')
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

module.exports = {
  name: "shuffle",
  description: "Shuffle queue",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    const noPlayingEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("There is nothing playing")
      .setFooter(copyright, picture);
    if (!queue) return message.channel.send(noPlayingEmbed).catch(console.error);
    if (!canModifyQueue(message.member)) return;

    let songs = queue.songs;
    for (let i = songs.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    queue.songs = songs;
    message.client.queue.set(message.guild.id, queue);
    const shuffledEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Shuffled!")
      .setDescription(`${message.author} shuffled the queue`)
      .setFooter(copyright, picture);
    queue.textChannel.send(shuffledEmbed).catch(console.error);
  }
};
