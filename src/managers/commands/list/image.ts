import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, Embed, EmbedBuilder, Events, Message, REST, StringSelectMenuBuilder, User } from "discord.js";
import { Argument, ArgumentType, Command, CommandManager, rest } from "../main";
import { Database } from "../../database/manager";
import { GetPercent } from "../../../utils/math";
import axios from "axios";
import { client } from "../../../main";

export class ImageQueryResult {
    public link: string;
    public title: string;
    public image: Image;
}

class Image {
    public contextLink: string;
}

export class ImageQuery {
    public results: Array<ImageQueryResult>;
    public index: number = 1;
    constructor(results: Array<ImageQueryResult>, index: number=1)
    {
        this.results = results;
        this.index = index;
    }
    public message: Message;
    public requestFrom: User;    
    public timestampWhenExpires: number;
    public timeout: NodeJS.Timeout;
}

export class ImageQueryManager {
    static #instance: ImageQueryManager = null;
    public queries: Array<ImageQuery> = [];

    private constructor () {}
    public static get instance(): ImageQueryManager {
        if(!this.#instance)
            this.#instance = new ImageQueryManager();

        return this.#instance;
    }

    public addQuery(query: ImageQuery) {
        this.queries.push(query)
        query.timeout = setTimeout(() => {
            this.removeQuery(query);
        }, 3*60*1000);
    }
    public async removeQuery(query: ImageQuery) {
        if(query.message)
            await query.message.delete();

        clearTimeout(query.timeout);
        this.queries.splice(this.queries.indexOf(query), 1);
    }
}

CommandManager.instance.Register(new Command('image', 'See your statistics', async(interaction: CommandInteraction) => {
    if(interaction.options.data.length === 0)
        return interaction.reply({ephemeral: true ,content: 'Please provide a Query string.'})

    interaction.deferReply();
    const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyCip75-CCj_1U42ZAyj0lUvH52LICW0a7M&cx=264e5f4bc281a46a3&searchType=image&q=${interaction.options.data.at(0).value.toString()}` )
    
    var item = response.data.items.at(0);
    const embed = new EmbedBuilder()
        .setColor(0xcf9700)
        .setDescription(`[${item.snippet}](${item.image.contextLink})`)
        .setTitle(`Search results for: ${item.title}`)
        .setImage(item.link)
        .setTimestamp()


    var currentRow = new ActionRowBuilder<ButtonBuilder>()

    const rows: Array<ActionRowBuilder<ButtonBuilder>> = [];

    var length = (response.data.items.length >= 10 ? 10 : response.data.items.length);
    for(var i = 1; i <= length; i++)
    {        
        var item = response.data.items.at(i);
        currentRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`image_${i}`)
                .setLabel(`${i}`)
                .setStyle(ButtonStyle.Primary)
            );

        if(i % 5 === 0)
        {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder<ButtonBuilder>();
        }

    }

    currentRow.addComponents(
        new ButtonBuilder()
        .setCustomId(`image_cancel`)
        .setLabel(`Cancel ✖️`)
        .setStyle(ButtonStyle.Danger)
    );

    rows.push(currentRow)

    var imageQuery: ImageQuery = new ImageQuery(response.data.items as Array<ImageQueryResult>, 1);
    imageQuery.requestFrom = interaction.user;
    imageQuery.message = await interaction.editReply({components: rows, embeds:[embed]});
    ImageQueryManager.instance.addQuery(imageQuery);
   
}, [new Argument(ArgumentType.STRING, 'query', 'image name')]));

client.on(Events.InteractionCreate, async(interaction: ButtonInteraction) => {
    if(!interaction.isButton())
        return;

    if(!interaction.customId.startsWith('image_'))
        return;

    interaction.deferUpdate();
    var id: number = parseInt(interaction.customId.split("image_")[1]);
    ImageQueryManager.instance.queries.forEach(query => {
        if(query.message.id === interaction.message.id)
        {
            var result : any = query.results.at(id-1);
            const embed = new EmbedBuilder()
                .setColor(0xcf9700)
                .setDescription(`[${result.snippet}](${result.image.contextLink})`)
                .setTitle(`Search results for: ${result.title}`)
                .setImage(result.link)
                .setTimestamp()
           
            query.index = id;
            query.message.edit({ embeds: [embed] })
        }

        if(interaction.customId === 'image_cancel' && query.requestFrom.id === interaction.user.id)
            ImageQueryManager.instance.removeQuery(query);
    });
});