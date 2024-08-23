import { CommandInteraction, GuildMember } from 'discord.js';
import ytdl from '@distube/ytdl-core';
import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior,
    StreamType,
    VoiceConnection,
    VoiceConnectionStatus,
    AudioPlayerStatus
} from '@discordjs/voice';

export class Song {
    constructor(public url: string) {}
}

export class MusicManager {
    static instance: MusicManager;
    public songs: Array<Song> = [];
    private connection: VoiceConnection | null = null;

    private constructor() {}

    public static getInstance(): MusicManager {
        if (!this.instance) {
            this.instance = new MusicManager();
        }
        return this.instance;
    }

    public addSong(song: Song) {
        this.songs.push(song);
    }

    private cleanupConnection(test: boolean=false) {
        if (this.connection) {
            if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                console.log('Destroying connection...');
                this.connection.destroy();
                // if(this.songs.length === 0)
                if(test)
                    this.songs = [];
            }
            this.connection = null; // Clear the connection reference
        }
    }

    public async playSong(interaction: CommandInteraction) {
        if (interaction.options.data.length === 0) {
            return interaction.channel.send({ content: 'Please specify a URL.' });
        }

        const url = interaction.options.data[0].value.toString();
        console.log(`Attempting to play URL: ${url}`);

        if (!ytdl.validateURL(url)) {
            return await interaction.channel.send({ content: 'That URL cannot be played.'});
        }

        const voiceChannel = (interaction.member as GuildMember).voice.channel;
        if (!voiceChannel) {
            return await interaction.channel.send('You need to be in a voice channel to play music.');
        }

        this.addSong(new Song(url));

        // Establish a new voice connection if not already present
        if (!this.connection || this.connection.state.status === VoiceConnectionStatus.Destroyed) {
            this.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            this.connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('The bot has connected to the channel!');
            });

            this.connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log('The bot has been disconnected from the channel!');
                this.cleanupConnection();
            });

            this.connection.on(VoiceConnectionStatus.Destroyed, () => {
                console.log('The bot has destroyed the connection!');
                this.cleanupConnection();
            });

            this.connection.on('error', (error) => {
                console.error('Voice Connection Error:', error);
                this.cleanupConnection(true);
            });
        }

        try {
            const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });

            const resource = createAudioResource(stream, {
                inputType: StreamType.Arbitrary,
            });

            player.play(resource);
            this.connection.subscribe(player);

            player.on(AudioPlayerStatus.Playing, () => {
                console.log('The bot has started playing the audio!');
                interaction.channel.send(`Now playing: ${url}`);
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Finished playing!');
                // this.cleanupConnection(false); // Clean up after playing
                console.log(this.songs.length );
                if (this.songs.length > 0) {

                    this.songs.shift(); // Remove the song from the queue
                    if (this.songs.length > 0) {
                        this.playNextSong(interaction);
                    }
                }
            });

            player.on('error', (error) => {
                console.error('Audio Player Error:', error);
                this.cleanupConnection(true);
            });

            await interaction.channel.send('Playing your video!');
        } catch (error) {
            console.error('Error during playback:', error);
            await interaction.channel.send('An error occurred while trying to play the video.');
            this.cleanupConnection(true);
        }
    }

    private async playNextSong(interaction: CommandInteraction) {
        if (this.songs.length > 0) {
            const nextSongUrl = this.songs[0].url;
            console.log("playing next song " + nextSongUrl);
            interaction.options.data[0].value = nextSongUrl;
            await this.playSong(interaction); // Recursively call playSong
        }
    }
}
