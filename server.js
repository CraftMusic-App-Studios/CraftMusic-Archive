/*--------------------------------------------------------------------------------
  Project : CraftMusic
  File    : server.js
  
  Copyright (C) 2020 - 2023 CraftMusic Bot Studios

  This file is an unmodified original from the source code of CraftMusic version 2. 
  No changes were made to the code, only comments were added for documentation.
--------------------------------------------------------------------------------*/

const { Client,
        Intents,
        ActivityFlags,
        Util,
        MessageEmbed,
        ShardingManager,
        StageChannel
      } = require('discord.js');

const Discord = require('discord.js');
const fetch = require('node-fetch');

const { PREFIX,
        token,
        webhookID,
        webhookToken,
        APIKey,
        notfallYTToken
      } = require("./config.json");

const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(APIKey)
//const youtube = new YouTube(notfallYTToken) // - A Second Youtube Token for the case that our Primary Token is rate-limited
require("./ExtendedMessage.js");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ] 
 });

const queue = new Map();

client.on('ready', () => {
    console.log("[MAIN | SHARD-MANAGER] A Shard Started.");
    client.user.setActivity("-help", { type: "STREAMING", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
});

client.on('message', async message => {

    // The API is not longer available since we are nowdays independend from the Platin Developmentstudios
    const res = await fetch('https://api.platin-developmentstudios.de/v3/:CraftMusic');
    const json = await res.json();

    //------------------------------------------------------------------------------//

    const noPlayingEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("ERROR")
        .setTitle("There is nothing to play.")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const notInVCEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("ERROR")
        .setDescription("You have to be in a music channel for that!")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const noConectPermissionEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("ERROR")
        .setDescription("I need CONNECT permissions")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const noSpeakPermissionEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("ERROR")
        .setDescription("I need SPEAK permissions")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const noSearchResultEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("ERROR")
        .setDescription("I could not find any videos related to your search term.")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const musicStoppedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Stopped!")
        .setDescription("Music stopped!")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const skippedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Skipped!")
        .setDescription("Music has skipped!")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const alreadyPausedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("ERROR")
        .setDescription("The music has already been paused! use -resume to play them again")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const pausedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Paused!")
        .setDescription("The music has been paused! play it back with -resume")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const alreadyResumedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("ERROR")
        .setDescription("The music is already playing! use -pause to stop it!")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    const resumedEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Resumed!")
        .setDescription("The music is playing again!")
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    //---------------------------------------------------------------------------------------//

    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.substring(PREFIX.length).split(" ");
    const searchString = args.slice(1).join(' ')
    const url = args[1] ? args[1].replace(/<._>/g, '$1') : ''
    const serverQueue = queue.get(message.guild.id)

    if (message.content.toLowerCase().startsWith(`${PREFIX}play`)) {

       // RATELIMIT - If the bot was ratelimited, this would be added to the code or out-commented and the bot restarted.
       /*const ratelimitEmbed = new MessageEmbed()
           .setColor('#6200FF')
           .setTitle("WARNING!")
           .setDescription("We are currently under a __YouTube Data API v3__ Ratelimit.")
           .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

        return message.channel.send(ratelimitEmbed);*/

       const voiceChannel = message.member.voice.channel
        const stageChannel = message.member.voice.channel
        if (!voiceChannel) return message.channel.send(notInVCEmbed)
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if (!permissions.has('CONNECT')) return message.channel.send(noConectPermissionEmbed)
        if (!permissions.has('SPEAK')) return message.channel.send(noSpeakPermissionEmbed)

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
            url: `https://www.youtube.com/watch?v=${video.id}`
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
                var connection = await voiceChannel.join()
                queueConstruct.connection = connection
                play(message.guild, queueConstruct.songs[0])
            } catch (error) {
                console.log(`[Client | Error] ${error}`)
                queue.delete(message.guild.id)
                return message.channel.send(`An error has occurred. error message:\n\n${error}\n\nplease send a screenshot of this message to the bot admin TheDomCraft#2157`)
            }
        } else {
            const addToQueueEmbed = new MessageEmbed()
                .setColor("#6200FF")
                .setTitle("Addet!")
                .setDescription(`**${song.title}** has been added to the queue`)
                .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

            serverQueue.songs.push(song)
            return message.channel.send(addToQueueEmbed)
        }
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}stop`)) {

        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end()
        message.channel.send(musicStoppedEmbed)
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
              .setDescription(`Current Volume: ${serverQueue.volume}`)
              .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

          return message.channel.send(volumeMgrV)
        }
        if (isNaN(args[1])) {
             const volumeMgrE = new MessageEmbed()
                 .setColor("#6200FF")
                 .setTitle("Volume Manager")
                 .setDescription("This is not a valid number to adjust the Volume!")
                 .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

             return message.channel.send(volumeMgrE)
        }
        serverQueue.volume = args[1]
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5)
          
          const volumeMgrS = new MessageEmbed()
                 .setColor("#6200FF")
                 .setTitle("Volume Manager")
                 .setDescription(`The volume was set to **${args[1]}** !`)
                 .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');
                 
        message.channel.send(volumeMgrS)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}np`)) {

        const nowPlayingEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Now Playing:")
            .setDescription(`- ${serverQueue.songs[0].title}`)
            .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        message.channel.send(nowPlayingEmbed)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}queue`)) {
        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        const queueSongsEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Songs in the Queue:")
            .setThumbnail('https://cdn.platin-developmentstudios.de/img/craftmusic-new.png')
            .setDescription(`${serverQueue.songs.map(song => `**-** [${song.title}](${song.url})`).join('\n')}`, { split: true })
            .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

        if (!serverQueue) return message.channel.send(noPlayingEmbed)
        message.channel.send(queueSongsEmbed)
        return undefined

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}pause`)) {

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
            .setThumbnail('https://cdn.platin-developmentstudios.de/img/craftmusic-new.png')
            .setDescription("**-play __name or link__** | play a song\n**-stop** | stop the currently playing song\n**-np** | see what is currently playing\n**-queue** | look what is currently in the queue\n**-pause** | pauses song\n**-loop** | enable / disable loop\n**-volume** __VolumeNumber__ | Change the Song Volume\n**-skip** | Skip to the next song in the queue\n**-safe** | send a embed with link and title of the currently playing song\n**-debug** | Get information about CraftMusic\n**-support** | Send a Embed with Link to the Official CraftMusic Support Server\n**-invite** | Invite CraftMusic to your Server!")
            .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');
        return message.channel.send(embed)

    } else if (message.content.toLowerCase().startsWith(`${PREFIX}loop`)) {

        if (!message.member.voice.channel) return message.channel.send(notInVCEmbed)
        if (!serverQueue) return message.channel.send(noPlayingEmbed)

        const loopEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Looped!")
            .setDescription(`I have now ${serverQueue.loop ? `**Disabled**` : `**Enabled**`} loop.`)
            .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

        serverQueue.loop = !serverQueue.loop

        return message.channel.send(loopEmbed)

    } else if(message.content.toLowerCase().startsWith(`${PREFIX}safe`)) {

        const grabEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("__Song Safed!__")
        .setDescription(`**Song Name:** ${serverQueue.songs[0].title}\n**Song on YouTube:** [Click Here!](${serverQueue.songs[0].url})`)
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

        if(!serverQueue.songs[0]) {

            message.channel.send(noPlayingEmbed)

        } else {

            message.author.send(grabEmbed)
            message.react('📭');

        }

        return undefined;

    } else if(message.content.toLowerCase().startsWith(`${PREFIX}send nudes`)) {

        const grabEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("__Song Safed!__")
        .setDescription(`**Song Name:** ${serverQueue.songs[0].title}\n**Song on YouTube:** [Click Here!](${serverQueue.songs[0].url})`)
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

        if(!serverQueue.songs[0]) {

            message.channel.send(noPlayingEmbed)

        } else {

            message.author.send(grabEmbed)
            message.react('📭');

        }

        return undefined;

    } else if(message.content.toLowerCase().startsWith(`-support`)) {
        const supportServerEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("CraftMusic Support")
            .setDescription("You need Support? Click [Here](https://discord.gg/6U3UcR54wH) to Join the Official CraftMusic Support Server!")
            .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');
        return message.channel.send(supportServerEmbed);

    } else if(message.content.toLowerCase().startsWith(`${PREFIX}api`)) {
        if(message.author.id == "553592716794003456") {
            message.inlineReply("Look at your DM's!");
        } else {
            message.inlineReply("you are not Whitelisted!");
        }
        return undefined;
        
    } else if(message.content.toLowerCase().startsWith(`${PREFIX}invite`)) {
        const botInviteEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("Invite CraftMusic")
            .setDescription("Click [Here](https://discord.com/api/oauth2/authorize?client_id=714595651811541133&permissions=8&redirect_uri=https%3A%2F%2Fcraftmusic.tk%2F&scope=bot%20applications.commands) to invite CraftMusic!")
            .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');
        return message.channel.send(botInviteEmbed);
        
    } else if(message.content.toLowerCase().startsWith(`${PREFIX}debug`)) {
        const debugEmbed = new MessageEmbed()
            .setColor("#6200FF")
            .setTitle("CraftMusic Debug")
            .setDescription(`**Node:** ${json["craftmusic"]["node"]} \n**Cluster:** ${json["craftmusic"]["cluster"]} \n**Ratelimited:** ${json["craftmusic"]["ratelimited"]} \n**Shard:** ${message.guild.shardID}`)
            .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

            return message.channel.send(debugEmbed);
    }
});

function play(guild, song) {
    const serverQueue = queue.get(guild.id)

    if (!song) {
        serverQueue.voiceChannel.leave()
        queue.delete(guild.id)
        return
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url, { opusEncoded: true, encoderArgs: ['-af', 'bass=g=5,dynaudnorm=f=100'] })) // 'bass=g=4,dynaudnorm=f=80
        .on('finish', () => {
            if (!serverQueue.loop) serverQueue.songs.shift()
            play(guild, serverQueue.songs[0])
        })
        .on('error', () => {
            console.log(error)
        })
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 3)

    const nowPlayEmbed = new MessageEmbed()
        .setColor("#6200FF")
        .setTitle("Playing a song!")
        .setDescription(`Now play **${song.title}** !\n\nSong on YouTube: [Click Here!](${song.url})`)
        .setFooter('CraftMusic | Created By TheDomCraft#2157', 'https://cdn.platin-developmentstudios.de/img/craftmusic-new.png');

    serverQueue.textChannel.send(nowPlayEmbed)
}

client.login(token);

// Sharding System

client.statusHook = new Discord.WebhookClient(webhookID, webhookToken);

client.on("shardReady", async shard => {
    client.statusHook.send(`Shard [**#${shard}**] wurde gestartet`);
});

client.on("shardDisconnect", async shard => {
    client.statusWebhook.send(`Shard [**#${shard}**] wurde heruntergefahren`)
});

client.on("shardReconnecting", async shard => {
    client.statusHook.send(`Shard [**#${shard}**] wird neugestartet...`)
});

client.on("shardResume", async shard => {
    client.statusHook.send(`Shard [**#${shard}**] wurde neugestartet.`)
});