const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageReactions] });

const channelId = '1334412534127788043';  // ID del canal donde quieres que se envíen los eventos
const roleId = '1334408903034667029';  // ID del rol a mencionar en los recordatorios

const events = [
    { nombre: 'ROBO A VEHÍCULO', dias: [2, 3], horarios: ['22:00', '13:00', '15:00', '17:00'], duracion: 2, recordatorio: true },
    { nombre: 'MISIÓN DE TRÁFICO ILEGAL', dias: [1, 4, 6], horarios: ['06:00', '15:00', '23:58'], duracion: 3, recordatorio: false },
    { nombre: 'ROBO A NEGOCIO', dias: [1, 3, 5, 0], horarios: ['02:10', '10:00'], duracion: 11, recordatorio: true },
    { nombre: 'LANCHA ENCALLADA', dias: [1, 2, 5, 0], horarios: ['00:00', '14:00', '16:00', '18:00'], duracion: 2, recordatorio: true },
    { nombre: 'METAFETAMINA DIA 1', dias: [1], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'METAFETAMINA DIA 2', dias: [3], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'METAFETAMINA DIA 3', dias: [5], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'DIA RECOMPENSA', dias: [0], horarios: ['05:00'], duracion: 16, recordatorio: false },
    { nombre: 'REPARTO AEREO', dias: [2, 5], horarios: ['07:00', '15:00', '20:00'], duracion: 3, recordatorio: true },
    { nombre: 'BUSQUEDA DE CONTENEDORES', dias: [4, 5], horarios: ['00:00', '15:00', '17:00', '19:00'], duracion: 2, recordatorio: true },
];

const timezone = 'America/Argentina/Buenos_Aires';  // Zona horaria de Argentina

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    // Programar los eventos
    setInterval(() => {
        let currentTime = moment().tz(timezone);
        let currentDay = currentTime.day();  // Día de la semana (0: Domingo, 1: Lunes, ..., 6: Sábado)
        let currentHour = currentTime.format('HH:mm');  // Hora actual en formato HH:mm

        events.forEach(event => {
            if (event.dias.includes(currentDay)) {
                event.horarios.forEach(async (hora) => {
                    if (currentHour === hora) {
                        // Aquí envías el embed y gestionas el evento
                        const channel = client.channels.cache.get(channelId);  // Usando la variable de canal
                        const embed = new EmbedBuilder()
                            .setTitle(`⛵ ${event.nombre} ⛵`)
                            .setDescription(`🟢 ACTIVIDAD ACTIVA*\n\n ⛵ Detalles de la misión: ¡No dejes pasar la oportunidad!`)
                            .setColor(0xff0000)
                            .setThumbnail("https://i.imgur.com/NpHargJ.png")
                            .setFooter({ text: "🔻 Atentamente Al Qaeda 🔻" });
                        
                        // Etiquetar un rol al enviar el mensaje
                        const role = channel.guild.roles.cache.get(roleId);  // Usando la variable de rol
                        const message = await channel.send({ content: `<@&${role.id}>`, embeds: [embed] });

                        // Añadir reacción de tilde
                        await message.react('✅');

                        // Enviar recordatorio después de una hora si el evento tiene recordatorio
                        if (event.recordatorio) {
                            setTimeout(async () => {
                                await message.react('✅');  // Asegúrate de que el recordatorio también tenga la reacción de tilde
                                const reminderMessage = await channel.send({ content: `⏰ Recordatorio: El evento ${event.nombre} está a punto de finalizar.` });
                            }, 60 * 60 * 1000); // 1 hora en milisegundos
                        }

                        // Borrar el mensaje y el embed cuando el evento termine
                        setTimeout(async () => {
                            await message.delete();
                        }, event.duracion * 60 * 60 * 1000);  // Duración del evento en milisegundos
                    }
                });
            }
        });
    }, 60000);  // Chequear cada minuto
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.emoji.name === '✅') {
        const message = reaction.message;
        const author = message.author;

        // Si el primer usuario reacciona con tilde, elimina el embed y evita el recordatorio
        if (message.reactions.cache.get('✅').users.cache.size === 1) {
            await message.delete();
        }
    }
});

client.login(process.env.TOKEN);  // Usar el token definido como variable de entorno

