/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : invite.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { MessageEmbed } = require("discord.js");
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

module.exports = {
  name: "invite",
  description: "Send bot invite link",
  execute(message) {
    const inviteEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Invite CraftMusic")
      .setDescription("Click [here](https://invite.craftmusic-bot.studio/) to invite CraftMusic!")
      .setFooter(copyright, picture);
    return message.member
      .send(inviteEmbed)
      .catch(console.error);
  }
};
