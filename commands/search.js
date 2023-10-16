/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : search.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { MessageEmbed } = require("discord.js");
const YouTubeAPI = require("simple-youtube-api");
const { YOUTUBE_API_KEY } = require("../util/Util");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

// ====================================================================================

/*const noConnectPermEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription("Cannot connect to voice channel, missing permissions")
  .setFooter(copyright, picture);

const noSpeakPermEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription("I cannot speak in this voice channel, make sure I have the proper permissions!")
  .setFooter(copyright, picture);*/

const notInVCEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription("You need to join a voice channel first!")
  .setFooter(copyright, picture);

/*const notInSameVCEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription(`You must be in the same channel as ${message.client.user}`)
  .setFooter(copyright, picture);*/

/*const playlistNotFoundEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription("Playlist not found.")
  .setFooter(copyright, picture);*/

// ====================================================================================

module.exports = {
  name: "search",
  description: "Search and select videos to play",
  async execute(message, args) {
    if (!args.length)
      return message
        .reply(noArgsEmbed)
        .catch(console.error);
    if (message.channel.activeCollector)
      return message.reply("A message collector is already active in this channel.");
    if (!message.member.voice.channel)
      return message.reply(notInVCEmbed).catch(console.error);
      
    const noArgsEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription(`Usage: ${message.client.prefix}search <Video Name>`)
      .setFooter(copyright, picture);

    const search = args.join(" ");

    let resultsEmbed = new MessageEmbed()
      .setTitle(`**Reply with the song number you want to play**`)
      .setDescription(`Results for: ${search}`)
      .setColor("#6200FF")
      .setFooter(copyright, picture);

    try {
      const results = await youtube.searchVideos(search, 10);
      results.map((video, index) => resultsEmbed.addField(video.shortURL, `${index + 1}. ${video.title}`));

      let resultsMessage = await message.channel.send(resultsEmbed);

      function filter(msg) {
        const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/g;
        return pattern.test(msg.content);
      }

      message.channel.activeCollector = true;
      const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
      const reply = response.first().content;

      if (reply.includes(",")) {
        let songs = reply.split(",").map((str) => str.trim());

        for (let song of songs) {
          await message.client.commands
            .get("play")
            .execute(message, [resultsEmbed.fields[parseInt(song) - 1].name]);
        }
      } else {
        const choice = resultsEmbed.fields[parseInt(response.first()) - 1].name;
        message.client.commands.get("play").execute(message, [choice]);
      }

      message.channel.activeCollector = false;
      resultsMessage.delete().catch(console.error);
      response.first().delete().catch(console.error);
    } catch (error) {
      console.error(error);
      message.channel.activeCollector = false;
      message.reply(error.message).catch(console.error);
    }
  }
};
