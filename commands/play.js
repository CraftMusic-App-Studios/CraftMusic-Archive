/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : play.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { play } = require("../include/play");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const https = require("https");
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, DEFAULT_VOLUME } = require("../util/Util");
const { MessageEmbed, Message } = require("discord.js");
const { COPYFILE_EXCL } = require("constants");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

// ====================================================================================

const noConnectPermEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription("Cannot connect to voice channel, missing permissions")
  .setFooter(copyright, picture);

const noSpeakPermEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription("I cannot speak in this voice channel, make sure I have the proper permissions!")
  .setFooter(copyright, picture);

// ====================================================================================

module.exports = {
  name: "play",
  cooldown: 3,
  aliases: ["p"],
  description: "Plays audio from YouTube",
  async execute(message, args) {
    const { channel } = message.member.voice;

    const serverQueue = message.client.queue.get(message.guild.id);
    const notInVCEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription("You need to join a voice channel first!")
      .setFooter(copyright, picture);
    if (!channel) return message.reply(notInVCEmbed).catch(console.error);
    const notInSameVCEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription(`You must be in the same channel as ${message.client.user}`)
      .setFooter(copyright, picture);
    if (serverQueue && channel !== message.guild.me.voice.channel) return message.reply(notInSameVCEmbed).catch(console.error);

    if (!args.length) {
      const noArgsEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription(`Usage: ${message.client.prefix}play <YouTube URL | Video Name>`)
        .setFooter(copyright, picture);
      return message
        .reply(noArgsEmbed)
        .catch(console.error);
    }
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.reply(noConnectPermEmbed);
    if (!permissions.has("SPEAK"))
      return message.reply(noSpeakPermEmbed);

    const search = args.join(" ");
    const cmArchivePattern = /^(https?:\/\/)?(play\.craftmusic-bot\.studio)\/(.*)$/;
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    /*const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;*/
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);
    const archiveUrlValid = cmArchivePattern.test(args[0]);

    // Start the playlist if playlist url was provided
    if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
      return message.client.commands.get("playlist").execute(message, args);
    } /*else if (scdl.isValidUrl(url) && url.includes("/sets/")) {
      return message.client.commands.get("playlist").execute(message, args);
    }

    if (mobileScRegex.test(url)) {
      try {
        https.get(url, function (res) {
          if (res.statusCode == "302") {
            return message.client.commands.get("play").execute(message, [res.headers.location]);
          } else {
            return message.reply("No content could be found at that url.").catch(console.error);
          }
        });
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
      return message.reply("Following url redirection...").catch(console.error);
    }*/

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: DEFAULT_VOLUME || 100,
      playing: true
    };

    let songInfo = null;
    let song = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    } /*else if (scRegex.test(url)) {
      try {
        const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
        song = {
          title: trackInfo.title,
          url: trackInfo.permalink_url,
          duration: Math.ceil(trackInfo.duration / 1000)
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    }*/
    else if (archiveUrlValid) {
      try {
        song = {
          title: "Playing from Archive",
          url: args[0],
          duration: "Undefined"
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1);
        songInfo = await ytdl.getInfo(results[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      const addedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Added!")
        .setDescription(`**${song.title}** has been added to the queue by ${message.author}`)
        .setFooter(copyright, picture);

      return serverQueue.textChannel
        .send(addedEmbed)
        .catch(console.error);
    }

    queueConstruct.songs.push(song);
    message.client.queue.set(message.guild.id, queueConstruct);

    try {
      queueConstruct.connection = await channel.join();
      await queueConstruct.connection.voice.setSelfDeaf(true);
      play(queueConstruct.songs[0], message);
    } catch (error) {
      console.error(error);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      const errorCantJoinVCEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription(`Could not join the channel: ${error}`)
        .setFooter(copyright, picture);
      return message.channel.send(errorCantJoinVCEmbed).catch(console.error);
    }
  }
};
