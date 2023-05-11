/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : server.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 3. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { Client,
        Intents,
        Util,
        MessageEmbed,
        ShardingManager,
      } = require('discord.js');

const Discord = require('discord.js');
const fetch = require('node-fetch');

const { PREFIX,
        token,
        APIKey,
        notfallYTToken
      } = require("./config.json");

const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(APIKey)
//const youtube = new YouTube(notfallYTToken) // - A Second Youtube Token for the case that our Primary Token is rate-limited

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ] 
 });

const queue = new Map();
const picture = 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png'
const copyright = 'CraftMusic | Created By TheDomCraft#2157'
const cmd = [
    "**-play __name or link__** | Play a song",
    "**-leave** | CraftMusic leave the Voice Channel",
    "**-now playing** or **-np** | See what is currently playing",
    "**-queue** | Look what is currently in the queue",
    "**-stop** | Pauses the playing song",
    "**-loop** | Enable / disable loop",
    "**-volume __VolumeNumber__** | Change the song volume",
    "**-skip** | Skip to the next song in the queue",
    "**-remove __SongNumber__** | Remove a song from the queue!",
    "**-safe** | Send a embed with link and title of the currently playing song",
    "**-debug** | Get information about CraftMusic",
    "**-support** | Send a Embed with Link to the official CraftMusic support server",
    "**-invite** | Invite CraftMusic to your server!"
]

client.on('ready', () => {
    console.log("[Client | Shard-Manager] A Shard Started.");
    client.user.setActivity("-help", { type: "STREAMING", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
});

client.on('message', async message => {

    // The API is not longer available since we are nowdays independend from the Platin Developmentstudios
    const res = await fetch('https://api.platin-developmentstudios.de/api/v5/:CraftMusic?key=5d9m00y0cnv4nvuj0m69pu');
    const json = await res.json();

    //---------------------------------------------------------------------------------------//

    const noPlayingEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription("There is nothing to play! Use **-play <__song name__>** to play a song!")
        .setFooter(copyright, picture);

    const notInVCEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription("You have to be in a voice channel for that!")
        .setFooter(copyright, picture);

    const noConectPermissionEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription("I need CONNECT permissions")
        .setFooter(copyright, picture);

    const noSpeakPermissionEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription("I need SPEAK permissions")
        .setFooter(copyright, picture);

    const noSearchResultEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription("I could not find any videos related to your search term.")
        .setFooter(copyright, picture);

    const musicStoppedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Stopped!")
        .setDescription("Music stopped!")
        .setFooter(copyright, picture);

    const skippedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Skipped!")
        .setDescription("Music has skipped!")
        .setFooter(copyright, picture);

    const alreadyPausedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription("The music has already been paused! use -resume to play them again")
        .setFooter(copyright, picture);

    const pausedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Paused!")
        .setDescription("The music has been paused! play it back with -resume")
        .setFooter(copyright, picture);

    const alreadyResumedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription("The music is already playing! use -stop to stop it!")
        .setFooter(copyright, picture);

    const resumedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Resumed!")
        .setDescription("The music is playing again!")
        .setFooter(copyright, picture);

    const nanEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Error!")
        .setDescription("Please enter a number")
        .setFooter(copyright, picture);

        const noArgsEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Error!")
            .setDescription("Please enter a song name or link")
            .setFooter(copyright, picture);

    //---------------------------------------------------------------------------------------//

    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.substring(PREFIX.length).split(" ");
    const searchString = args.slice(1).join(' ')
    const url = args[1] ? args[1].replace(/<._>/g, '$1') : ''
    const serverQueue = queue.get(message.guild.id)

    if (message.content.toLowerCase().startsWith(`${PREFIX}play`)) {

       if(json["craftmusic"]["ratelimited"] == "Yes") {
           const ratelimitEmbed = new MessageEmbed()
               .setColor('#6200FF')
               .setTitle("Error!")
               .setDescription("We are currently under a __YouTube Data API v3__ ratelimit.")
               .setFooter(copyright, picture);

            return message.channel.send(ratelimitEmbed);
       } else {

            const voiceChannel = message.member.voice.channel
            if (!voiceChannel) return message.channel.send(notInVCEmbed)
            const permissions = voiceChannel.permissionsFor(message.client.user)
            if (!permissions.has('CONNECT')) return message.channel.send(noConectPermissionEmbed)
            if (!permissions.has('SPEAK')) return message.channel.send(noSpeakPermissionEmbed)
            if(!args[1]) return message.channel.send(noArgsEmbed)
            if(args[1] == " ") return message.channel.send(noArgsEmbed)

            try {
                var video = await youtube.getVideoByID(url)
            } catch {
                try {
                    var videos = await youtube.searchVideos(searchString, 1)
                    var video = await youtube.getVideoByID(videos[0].id)
                } catch {
                    message.channel.send(noSearchResultEmbed)
                }
            }

            const song = {
                id: video.id,
                title: video.title,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                duration: `${video.duration.hours}:${video.duration.minutes}:${video.duration.seconds}`,
                thubnail: video.thumbnails
            }

            if (!serverQueue) {
                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 3,
                    playing: true,
                    loop: false,
                }
                queue.set(message.guild.id, queueConstruct)

                queueConstruct.songs.push(song)

                try {
                    var connection = await message.member.voice.channel.join()
                    queueConstruct.connection = connection
                    play(message.guild, queueConstruct.songs[0])
                } catch (error) {
                    console.log(`[Client | Error] ${error}`)
                    queue.delete(message.guild.id)
                    const errorEmbed = new MessageEmbed()
                        .setColor("#6200FF")
                        .setTitle("Error!")
                        .setDescription(`An error has occurred. error message:\n\n${error}\n\nplease send a screenshot of this message to the bot admin TheDomCraft#2157`)
                        .setFooter(copyright, picture);
                    return message.channel.send(errorEmbed)
                }
            } else {
                const addToQueueEmbed = new MessageEmbed()
                    .setColor("#6200FF")
                    .setTitle("Addet!")
                    .setDescription(`**${song.title}** has been added to the queue`)
                    .setFooter(copyright, picture);

                serverQueue.songs.push(song)
                return message.channel.send(addToQueueEmbed)
            }
            return undefined
        }

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}leave`)) {

        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end()
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}skip`)) {

        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        serverQueue.connection.dispatcher.end()
        message.channel.send(skippedEmbed)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}volume`)) {

        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        if (!args[1]) {
          const volumeMgrV = new MessageEmbed()
              .setColor("#6200FF")
              .setTitle("Volume Manager")
              .setDescription(`Current volume: ${serverQueue.volume}`)
              .setFooter(copyright, picture);

          return message.channel.send(volumeMgrV)
        }
        if (isNaN(args[1])) {
             const volumeMgrE = new MessageEmbed()
                 .setColor("#6200FF")
                 .setTitle("Volume Manager")
                 .setDescription("This is not a valid number to adjust the volume!")
                 .setFooter(copyright, picture);

             return message.channel.send(volumeMgrE)
        }
        serverQueue.volume = args[1]
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5)
          
          const volumeMgrS = new MessageEmbed()
                 .setColor("#6200FF")
                 .setTitle("Volume Manager")
                 .setDescription(`The volume was set to **${args[1]}** !`)
                 .setFooter(copyright, picture);
                 
        message.channel.send(volumeMgrS)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}np`)) {
        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)

        const nowPlayingEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Now Playing:")
            .setDescription(`- ${serverQueue.songs[0].title}\nLoop: ${serverQueue.loop ? `**Enabled**` : `**Disabled**`}`)
            .setFooter(copyright, picture);

        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        message.channel.send(nowPlayingEmbed)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}now playing`)) {
        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)

        const nowPlayingEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Now Playing:")
            .setDescription(`- ${serverQueue.songs[0].title}\nLoop: ${serverQueue.loop ? `**Enabled**` : `**Disabled**`}`)
            .setFooter(copyright, picture);

        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        message.channel.send(nowPlayingEmbed)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}queue`)) {
        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        const queueSongsEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Songs in the Queue:")
            .setThumbnail(picture)
            .setDescription(`${serverQueue.songs.map(song => `**-** [${song.title}](${song.url}) - ${song.duration}`).join('\n')}`, { split: true })
            .setFooter(copyright, picture);

        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        message.channel.send(queueSongsEmbed)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}stop`)) {

        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        if (!serverQueue.playing) return message.channel.send(alreadyPausedEmbed)
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        message.channel.send(pausedEmbed)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}resume`)) {

        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        if (serverQueue.playing) return message.channel.send(alreadyResumedEmbed)
        serverQueue.playing = true
        serverQueue.connection.dispatcher.resume()
        message.channel.send(resumedEmbed)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}help`)) {

        const embed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("CraftMusic Commands")
            .setThumbnail(picture)
            .setDescription(`${cmd.map(cmd => `${cmd}`).join('\n\n')}`, { split: true })
            .setFooter(copyright, picture);
        return message.channel.send(embed)

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}loop`)) {

        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)

        const loopEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Looped!")
            .setDescription(`I have now ${serverQueue.loop ? `**Disabled**` : `**Enabled**`} loop.`)
            .setFooter(copyright, picture);

        serverQueue.loop = !serverQueue.loop

        return message.channel.send(loopEmbed)

    } else if(message.content.toLowerCase().startsWith(`${PREFIX}safe`)) {
        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        const grabEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("__Song Safed!__")
        .setDescription(`**Song Name:** ${serverQueue.songs[0].title}\n**Song on YouTube:** [Click Here!](${serverQueue.songs[0].url})`)
        .setFooter(copyright, picture);
        if(!serverQueue.songs[0]) {
            message.channel.send(noPlayingEmbed)
        } else {
            message.author.send(grabEmbed)
            message.react('📭');
        }
        return undefined;

    } else if(message.content.toLowerCase().startsWith(`${PREFIX}support`)) {
        const supportServerEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("CraftMusic Support")
            .setDescription("You need Support? Click [Here](https://discord.gg/6U3UcR54wH) to Join the Official CraftMusic Support Server!")
            .setFooter(copyright, picture);
        return message.channel.send(supportServerEmbed);

    } else if(message.content.toLowerCase().startsWith(`${PREFIX}invite`)) {
        const botInviteEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Invite CraftMusic")
            .setDescription("Click [Here](https://invite.craftmusic-bot.ml/) to invite CraftMusic!")
            .setFooter(copyright, picture);
        return message.channel.send(botInviteEmbed);
        
    } else if(message.content.toLowerCase().startsWith(`${PREFIX}debug`)) {
        const debugEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("CraftMusic Debug")
            .setDescription(`**Node:** ${json["craftmusic"]["node"]} \n**Cluster:** ${json["craftmusic"]["cluster"]} \n**Ratelimited:** ${json["craftmusic"]["ratelimited"]} \n**Shard:** ${message.guild.shardID}`)
            .setFooter(copyright, picture);

            return message.channel.send(debugEmbed);

    } else if(message.content.toLowerCase().startsWith(`${PREFIX}remove`)) {
        const args = message.content.substring(PREFIX.length).split(" ");
        const serverQueue = queue.get(message.guild.id)
        require('array-lib')
        if (!serverQueue) {
            message.channel.send(noPlayingEmbed)
        } else if(!message.member.voice.channel) {
            message.channel.send(notInVCEmbed)
        } else if(isNaN(args[1])) {
            message.channel.send(nanEmbed)
        } else if(args[1] == 1) {
                const skipEmbed = new MessageEmbed()
                    .setColor("#6200FF")
                    .setTitle("Error!")
                    .setDescription("Please use **-skip** to remove this song")
                    .setFooter(copyright, picture);
                message.channel.send(skipEmbed)
        } else {
            serverQueue.songs.remove(args[1]-1)
            const removedEmbed = new MessageEmbed()
                .setColor("#6200FF")
                .setTitle("Removed!")
                .setDescription(`I removed the song at position ${args[1]} in the queue!`)
                .setFooter(copyright, picture);
            message.channel.send(removedEmbed)
        }
        return undefined

    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id)

    if (!song) {
        serverQueue.voiceChannel.leave()
        queue.delete(guild.id)
        const leaveEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("The Party is Over!")
            .setDescription("There's no song left in queue. use **-play <__song name__>** to play a song!")
            .setFooter(copyright, picture);
        serverQueue.textChannel.send(leaveEmbed)
        return undefined
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url, { opusEncoded: true, encoderArgs: ['-af', 'bass=g=5,dynaudnorm=f=100'] }))
        .on('finish', () => {
            if (!serverQueue.loop) serverQueue.songs.shift()
            play(guild, serverQueue.songs[0])
        })
        .on('error', () => {
            console.log(error)
        })
    //dispatcher.setVolumeLogarithmic(serverQueue.volume / 3)

    const nowPlayEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Playing a song!")
        .setDescription(`Now playing: **${song.title}** !\n\nSong on YouTube: [Click Here!](${song.url})\n\nSong Length: ${song.duration}`)
        .setFooter(copyright, picture);

    if(serverQueue.loop == true) {
        return undefined
    } else {
        serverQueue.textChannel.send(nowPlayEmbed)
    }
}

client.login(token);