/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : loop.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { canModifyQueue } = require("../util/Util");
const { MessageEmbed } = require("discord.js");
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

module.exports = {
  name: "loop",
  aliases: ["l"],
  description: "Toggle music loop",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    const noPlayingEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("There is nothing playing")
      .setFooter(copyright, picture);
    if (!queue) return message.reply(noPlayingEmbed).catch(console.error);
    if (!canModifyQueue(message.member)) return;

    // toggle from false to true and reverse
    queue.loop = !queue.loop;
    const loopedEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Looped!")
      .setDescription(`Loop is now ${queue.loop ? "**on**" : "**off**"}`)
      .setFooter(copyright, picture);
    return queue.textChannel.send(loopedEmbed).catch(console.error);
  }
};
