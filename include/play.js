/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : play.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 4. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const ytdl = require("erit-ytdl");
const scdl = require("soundcloud-downloader").default;
const { canModifyQueue, STAY_TIME } = require("../util/Util");
const { MessageEmbed } = require("discord.js");
const picture = "https://cdn.platin-developmentstudios.de/img/craftmusic-new.png";
const copyright = "CraftMusic | Created By TheDomCraft#2157"

// ==============================---{ Embeds }---==============================//

const leaveVCEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("Please wait...")
  .setDescription("Leaving voice channel...")
  .setFooter(copyright, picture);

const partyEndedEmbed = new MessageEmbed()
  .setColor("#6200FF")
  .setTitle("The party is over!")
  .setDescription("There is nothing to play.")
  .setFooter(copyright, picture);

// ==============================---{ Embeds }---==============================//

module.exports = {
  async play(song, message) {
    const { SOUNDCLOUD_CLIENT_ID } = require("../util/Util");

    let config;

    try {
      config = require("../config.json");
    } catch (error) {
      config = null;
    }

    const PRUNING = config ? config.PRUNING : process.env.PRUNING;

    const queue = message.client.queue.get(message.guild.id);

    if (!song) {
      setTimeout(function () {
        if (queue.connection.dispatcher && message.guild.me.voice.channel) return;
        queue.channel.leave();
        queue.textChannel.send(leaveVCEmbed);
      }, STAY_TIME * 1000);
      queue.textChannel.send(partyEndedEmbed).catch(console.error);
      return message.client.queue.delete(message.guild.id);
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
      } else if (song.url.includes("play.craftmusic-bot.studio")) {
        try {
          stream = song.url;
          streamType = "unknown"
        } catch (error) {
          stream = song.url;
          streamType = "unknown";
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      }

      console.error(error);
      return message.channel.send(`Error: ${error.message ? error.message : error}`);
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));
    const dispatcher = queue.connection
      .play(stream, { type: streamType })
      //.play(stream)
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

        if (queue.loop) {
          // if loop is on, push the song back at the end of the queue
          // so it can repeat endlessly
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message);
        } else {
          // Recursively play the next song
          queue.songs.shift();
          module.exports.play(queue.songs[0], message);
        }
      })
      .on("error", (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);

    try {
      const startedPlayingEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("The music is playing!")
        .setDescription(`Started playing: **${song.title}** | [Song on YouTube](${song.url})`)
        .setFooter(copyright, picture);
      var playingMessage = await queue.textChannel.send(startedPlayingEmbed);
      await playingMessage.react("⏭");
      await playingMessage.react("⏯");
      await playingMessage.react("🔇");
      await playingMessage.react("🔉");
      await playingMessage.react("🔊");
      await playingMessage.react("🔁");
      await playingMessage.react("⏹");
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on("collect", (reaction, user) => {
      if (!queue) return;
      const member = message.guild.member(user);

      switch (reaction.emoji.name) {
        case "⏭":
          queue.playing = true;
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.connection.dispatcher.end();
          const skippedEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Skipped!")
            .setDescription(`${user} skipped the song`)
            .setFooter(copyright, picture);
          queue.textChannel.send(skippedEmbed).catch(console.error);
          collector.stop();
          break;

        case "⏯":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause(true);
            const pausedEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Paused!")
            .setDescription(`${user} paused the music.`)
            .setFooter(copyright, picture);
            queue.textChannel.send(pausedEmbed).catch(console.error);
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            const resumedEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Resumed!")
            .setDescription(`${user} resumed the music!`)
            .setFooter(copyright, picture);
            queue.textChannel.send(resumedEmbed).catch(console.error);
          }
          break;

        case "🔇":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.volume <= 0) {
            queue.volume = 100;
            queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            const unmutedEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Unmuted!")
            .setDescription(`${user} unmuted the music!`)
            .setFooter(copyright, picture);
            queue.textChannel.send(unmutedEmbed).catch(console.error);
          } else {
            queue.volume = 0;
            queue.connection.dispatcher.setVolumeLogarithmic(0);
            const mutedEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Muted!")
            .setDescription(`${user} muted the music!`)
            .setFooter(copyright, picture);
            queue.textChannel.send(mutedEmbed).catch(console.error);
          }
          break;

        case "🔉":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member) || queue.volume == 0) return;
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          const decreasedEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Decreased!")
            .setDescription(`${user} decreased the volume, the volume is now ${queue.volume}%`)
            .setFooter(copyright, picture);
          queue.textChannel
            .send(decreasedEmbed)
            .catch(console.error);
          break;

        case "🔊":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member) || queue.volume == 100) return;
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          const incrasedEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Increased!")
            .setDescription(`${user} increased the volume, the volume is now ${queue.volume}%`)
            .setFooter(copyright, picture);
          queue.textChannel
            .send(incrasedEmbed)
            .catch(console.error);
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.loop = !queue.loop;
          const loopEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Looped!")
            .setDescription(`Loop is now ${queue.loop ? "**on**" : "**off**"}`)
            .setFooter(copyright, picture);
          queue.textChannel.send(loopEmbed).catch(console.error);
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.songs = [];
          const stopedEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Stoped!")
            .setDescription(`${user} stopped the music!`)
            .setFooter(copyright, picture);
          queue.textChannel.send(stopedEmbed).catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    });

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error);
      if (PRUNING && playingMessage && !playingMessage.deleted) {
        playingMessage.delete({ timeout: 3000 }).catch(console.error);
      }
    });
  }
};
