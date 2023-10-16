/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : debug.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { MessageEmbed } = require('discord.js');
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157";

module.exports = {
    name: "debug",
    aliases: [],
    description: "Status of CraftMusic",
    execute(message) {
        const statusEmbed = new MessageEmbed()
            .setTitle("CraftMusic Debug")
            .setColor("#6200FF")
            .setDescription("API: Online\nNode: cm-scn-1\nShard: Undefined")
            .setFooter(copyright, picture);

        return message.channel.send(statusEmbed);
    }
}