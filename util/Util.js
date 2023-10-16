/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : Util.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

exports.canModifyQueue = (member) => {
  const { channelID } = member.voice;
  const botChannel = member.guild.voice.channelID;
  const { MessageEmbed } = require("discord.js");
  const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
  const copyright = "CraftMusic | Created By TheDomCraft#2157"
  const vcjoinembed = new MessageEmbed()
    .setColor("#6200FF")
    .setTitle("Error!")
    .setDescription("You need to join the voice channel first!")
    .setFooter(copyright, picture);

  if (channelID !== botChannel) {
    member.send(vcjoinembed).catch(console.error);
    return;
  }

  return true;
};

let config;

try {
  config = require("../config.json");
} catch (error) {
  config = null;
}

exports.TOKEN = config ? config.TOKEN : process.env.TOKEN;
exports.PREFIX = config ? config.PREFIX : process.env.PREFIX;
exports.YOUTUBE_API_KEY = config ? config.YOUTUBE_API_KEY : process.env.YOUTUBE_API_KEY;
exports.SOUNDCLOUD_CLIENT_ID = config ? config.SOUNDCLOUD_CLIENT_ID : process.env.SOUNDCLOUD_CLIENT_ID;
exports.MAX_PLAYLIST_SIZE = config ? config.MAX_PLAYLIST_SIZE : process.env.MAX_PLAYLIST_SIZE;
exports.PRUNING = config ? config.PRUNING : process.env.PRUNING;
exports.STAY_TIME = config ? config.STAY_TIME : process.env.STAY_TIME;
exports.DEFAULT_VOLUME = config ? config.DEFAULT_VOLUME: process.env.DEFAULT_VOLUME;
