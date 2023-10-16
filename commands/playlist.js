/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : playlist.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { MessageEmbed } = require("discord.js");
const { play } = require("../include/play");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, MAX_PLAYLIST_SIZE, DEFAULT_VOLUME } = require("../util/Util");
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

const notInVCEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription("You need to join a voice channel first!")
  .setFooter(copyright, picture);

const playlistNotFoundEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Error!")
  .setDescription("Playlist not found.")
  .setFooter(copyright, picture);

// ====================================================================================

module.exports = {
  name: "playlist",
  cooldown: 5,
  aliases: ["pl"],
  description: "Play a playlist from youtube",
  async execute(message, args) {
    const { channel } = message.member.voice;
    const serverQueue = message.client.queue.get(message.guild.id);
    const noArgsEmbed = new MessageEmbed()
      .setColor("#6200FF")
      .setTitle("Error!")
      .setDescription(`Usage: ${message.client.prefix}playlist <YouTube Playlist URL | Video Name>`)
      .setFooter(copyright, picture);

    if (!args.length)
      return message
        .reply(noArgsEmbed)
        .catch(console.error);
    if (!channel) return message.reply(notInVCEmbed).catch(console.error);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.reply(noConnectPermEmbed);
    if (!permissions.has("SPEAK"))
      return message.reply(noSpeakPermEmbed);

    if (serverQueue && channel !== message.guild.me.voice.channel) {
      const notInSameVCEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription(`You must be in the same channel as ${message.client.user}`)
        .setFooter(copyright, picture);
      return message.reply(notInSameVCEmbed).catch(console.error);
    }

    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(args[0]);

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: DEFAULT_VOLUME || 100,
      playing: true
    };

    let playlist = null;
    let videos = [];

    if (urlValid) {
      try {
        playlist = await youtube.getPlaylist(url, { part: "snippet" });
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
      } catch (error) {
        console.error(error);
        return message.reply(playlistNotFoundEmbed).catch(console.error);
      }
    } /*else if (scdl.isValidUrl(args[0])) {
      if (args[0].includes("/sets/")) {
        message.channel.send("⌛ fetching the playlist...");
        playlist = await scdl.getSetInfo(args[0], SOUNDCLOUD_CLIENT_ID);
        videos = playlist.tracks.map((track) => ({
          title: track.title,
          url: track.permalink_url,
          duration: track.duration / 1000
        }));
      }
    }*/ else {
      try {
        const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
        playlist = results[0];
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    }

    const newSongs = videos.map((video) => {
      return (song = {
        title: video.title,
        url: video.url,
        duration: video.durationSeconds
      });
    });

    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);
    const songs = serverQueue ? serverQueue.songs : queueConstruct.songs;

    let playlistEmbed = new MessageEmbed()
      .setTitle(`${playlist.title}`)
      .setDescription(songs.map((song, index) => `${index + 1}. ${song.title}`))
      .setURL(playlist.url)
      .setColor("#6200FF")
      .setFooter(copyright, picture);
    if (playlistEmbed.description.length >= 2048)
      playlistEmbed.description =
        playlistEmbed.description.substr(0, 2007) + "\nPlaylist larger than character limit...";

    message.channel.send(`${message.author} Started a playlist`, playlistEmbed);

    if (!serverQueue) {
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
        .setDescription(`Could not join the channel: ${error.message}`)
        .setFooter(copyright, picture);
        return message.channel.send(errorCantJoinVCEmbed).catch(console.error);
      }
    }
  }
};
