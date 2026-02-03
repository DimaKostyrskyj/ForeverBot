const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./Config');

// Создаем клиента
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Цвета (черно-белая тема)
const COLORS = {
    WHITE: 0xFFFFFF,
    BLACK: 0x000000,
    GRAY: 0x36393F
};

// Файл для хранения заявок
const APPLICATIONS_FILE = path.join(__dirname, 'applications.json');

// Инициализация файла заявок
if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify({}, null, 2));
}

// Функции для работы с заявками
function loadApplications() {
    try {
        const data = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        return {};
    }
}

function saveApplications(applications) {
    try {
        fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
    } catch (error) {
        console.error('Ошибка сохранения заявок:', error);
    }
}

// Событие: бот готов
client.once('ready', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✓ Бот запущен: ${client.user.tag}`);
    console.log(`✓ ID: ${client.user.id}`);
    console.log(`✓ Серверов: ${client.guilds.cache.size}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Установка статуса
    const activityTypes = {
        'PLAYING': ActivityType.Playing,
        'WATCHING': ActivityType.Watching,
        'LISTENING': ActivityType.Listening,
        'COMPETING': ActivityType.Competing
    };

    client.user.setActivity(config.bot.activity, { 
        type: activityTypes[config.bot.activityType] || ActivityType.Watching 
    });

    // Регистрация команд
    await registerCommands();
});

// Регистрация slash команд
async function registerCommands() {
    const commands = [
        {
            name: 'заявка',
            description: 'Подать заявку в семью Forever',
            options: [
                {
                    name: 'имя',
                    description: 'Ваше имя и фамилия в игре (например: John Smith)',
                    type: 3,
                    required: true
                },
                {
                    name: 'возраст',
                    description: 'Ваш возраст',
                    type: 4,
                    required: true
                },
                {
                    name: 'опыт',
                    description: 'Сколько времени играете на проекте',
                    type: 3,
                    required: true
                },
                {
                    name: 'причина',
                    description: 'Почему хотите вступить в Forever Family?',
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'принять',
            description: 'Принять заявку (администрация)',
            options: [
                {
                    name: 'пользователь',
                    description: 'Пользователь для принятия',
                    type: 6,
                    required: true
                }
            ]
        },
        {
            name: 'отклонить',
            description: 'Отклонить заявку (администрация)',
            options: [
                {
                    name: 'пользователь',
                    description: 'Пользователь',
                    type: 6,
                    required: true
                },
                {
                    name: 'причина',
                    description: 'Причина отклонения',
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: 'инфо',
            description: 'Информация о семье Forever'
        },
        {
            name: 'статистика',
            description: 'Статистика заявок (администрация)'
        }
    ];

    try {
        console.log('⏳ Регистрация команд...');
        await client.application.commands.set(commands);
        console.log('✓ Команды зарегистрированы успешно');
    } catch (error) {
        console.error('✗ Ошибка регистрации команд:', error);
    }
}

// Событие: новый участник
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.get(config.channels.welcome);
    if (!welcomeChannel) {
        console.log('⚠️ Канал приветствий не найден');
        return;
    }

    // Минималистичное приветствие
    const welcomeEmbed = new EmbedBuilder()
        .setColor(COLORS.WHITE)
        .setDescription(
            `# 🤍\n\n` +
            `### Добро пожаловать, ${member}\n` +
            `─────────────────────\n\n` +
            `**Forever Family** рады видеть тебя\n\n` +
            `Используй </заявка:0> для вступления\n` +
            `─────────────────────`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
            text: `Участник #${member.guild.memberCount}`,
            iconURL: member.guild.iconURL({ dynamic: true })
        });

    await welcomeChannel.send({ embeds: [welcomeEmbed] });

    // Выдача роли
    try {
        const role = member.guild.roles.cache.get(config.roles.auto);
        if (role) {
            await member.roles.add(role);
            console.log(`✓ Роль выдана: ${member.user.tag}`);
        } else {
            console.log('⚠️ Роль для автовыдачи не найдена');
        }
    } catch (error) {
        console.error('✗ Ошибка выдачи роли:', error);
    }
});

// Событие: участник покинул сервер
client.on('guildMemberRemove', async (member) => {
    const welcomeChannel = member.guild.channels.cache.get(config.channels.welcome);
    if (!welcomeChannel) return;

    const leaveEmbed = new EmbedBuilder()
        .setColor(COLORS.BLACK)
        .setDescription(`**${member.user.tag}** покинул сервер`)
        .setFooter({ text: `Осталось участников: ${member.guild.memberCount}` });

    await welcomeChannel.send({ embeds: [leaveEmbed] });
});

// Обработка команд
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'заявка':
                await handleApplication(interaction);
                break;
            case 'принять':
                await handleAccept(interaction);
                break;
            case 'отклонить':
                await handleReject(interaction);
                break;
            case 'инфо':
                await handleInfo(interaction);
                break;
            case 'статистика':
                await handleStats(interaction);
                break;
        }
    } catch (error) {
        console.error(`✗ Ошибка обработки команды ${commandName}:`, error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription('❌ Произошла ошибка при выполнении команды');

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

// Команда: заявка
async function handleApplication(interaction) {
    const name = interaction.options.getString('имя');
    const age = interaction.options.getInteger('возраст');
    const experience = interaction.options.getString('опыт');
    const reason = interaction.options.getString('причина');

    // Проверка возраста
    if (age < config.application.minAge) {
        const errorEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription(
                `# ❌\n\n` +
                `### Отказано в подаче заявки\n` +
                `─────────────────────\n\n` +
                `Минимальный возраст: **${config.application.minAge} лет**\n` +
                `Ваш возраст: **${age} лет**\n` +
                `─────────────────────`
            );
        
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Проверка длины причины
    if (reason.length < config.application.minReasonLength) {
        const errorEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription(
                `# ❌\n\n` +
                `### Причина слишком короткая\n` +
                `─────────────────────\n\n` +
                `Минимум: **${config.application.minReasonLength} символов**\n` +
                `Ваша: **${reason.length} символов**\n\n` +
                `Опишите подробнее, почему хотите\n` +
                `вступить в Forever Family\n` +
                `─────────────────────`
            );
        
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Проверка существующей заявки
    const applications = loadApplications();
    const existingApp = Object.values(applications).find(app => 
        app.userId === interaction.user.id && app.status === 'pending'
    );

    if (existingApp) {
        const errorEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription(
                `# ⏳\n\n` +
                `### У вас уже есть активная заявка\n` +
                `─────────────────────\n\n` +
                `Дождитесь решения администрации\n` +
                `по текущей заявке\n` +
                `─────────────────────`
            );
        
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Отправка в канал заявок
    const appChannel = interaction.guild.channels.cache.get(config.channels.applications);
    if (!appChannel) {
        const errorEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription('❌ Канал заявок не настроен');
        
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const applicationEmbed = new EmbedBuilder()
        .setColor(COLORS.WHITE)
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(
            `# 📋 НОВАЯ ЗАЯВКА\n` +
            `─────────────────────\n\n` +
            `**Игровое имя:** ${name}\n` +
            `**Возраст:** ${age} лет\n` +
            `**Опыт игры:** ${experience}\n\n` +
            `**Почему хочет вступить:**\n` +
            `${reason}\n` +
            `─────────────────────\n` +
            `Пользователь: ${interaction.user}\n` +
            `ID: \`${interaction.user.id}\``
        )
        .setFooter({ text: 'Используйте /принять или /отклонить' })
        .setTimestamp();

    await appChannel.send({ embeds: [applicationEmbed] });

    // Сохранение заявки
    const appId = `app_${Date.now()}_${interaction.user.id}`;
    applications[appId] = {
        userId: interaction.user.id,
        userName: interaction.user.tag,
        name: name,
        age: age,
        experience: experience,
        reason: reason,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    saveApplications(applications);

    console.log(`✓ Новая заявка от ${interaction.user.tag}`);

    // Подтверждение
    const confirmEmbed = new EmbedBuilder()
        .setColor(COLORS.WHITE)
        .setDescription(
            `# ✓\n\n` +
            `### Заявка отправлена\n` +
            `─────────────────────\n\n` +
            `Ваша заявка **принята на рассмотрение**\n\n` +
            `Ожидайте ответа от администрации\n` +
            `Вы получите уведомление в ЛС\n` +
            `─────────────────────`
        );

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}

// Команда: принять
async function handleAccept(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const errorEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription('❌ Недостаточно прав');
        
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const user = interaction.options.getMember('пользователь');
    
    // Обновление статуса заявки
    const applications = loadApplications();
    for (const [appId, app] of Object.entries(applications)) {
        if (app.userId === user.id) {
            app.status = 'accepted';
            app.acceptedBy = interaction.user.tag;
            app.acceptedAt = new Date().toISOString();
            break;
        }
    }
    saveApplications(applications);

    // Выдача роли участника
    try {
        const memberRole = interaction.guild.roles.cache.get(config.roles.member);
        if (memberRole) {
            await user.roles.add(memberRole);
            console.log(`✓ Роль участника выдана: ${user.user.tag}`);
        }
    } catch (error) {
        console.error('✗ Ошибка выдачи роли:', error);
    }

    // Сообщение в канал
    const acceptEmbed = new EmbedBuilder()
        .setColor(COLORS.WHITE)
        .setDescription(
            `# ✓ ЗАЯВКА ПРИНЯТА\n\n` +
            `${user} **принят в Forever Family**\n\n` +
            `Добро пожаловать в семью!\n` +
            `─────────────────────\n` +
            `Администратор: ${interaction.user}`
        );

    await interaction.reply({ embeds: [acceptEmbed] });

    console.log(`✓ Заявка принята: ${user.user.tag} (админ: ${interaction.user.tag})`);

    // ЛС пользователю
    try {
        const dmEmbed = new EmbedBuilder()
            .setColor(COLORS.WHITE)
            .setDescription(
                `# ✓ ЗАЯВКА ОДОБРЕНА\n\n` +
                `### Поздравляем!\n` +
                `─────────────────────\n\n` +
                `Ваша заявка в **Forever Family** была одобрена\n\n` +
                `Добро пожаловать в нашу семью!\n` +
                `─────────────────────`
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        await user.send({ embeds: [dmEmbed] });
    } catch (error) {
        console.log('⚠️ Не удалось отправить ЛС пользователю');
    }
}

// Команда: отклонить
async function handleReject(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const errorEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription('❌ Недостаточно прав');
        
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const user = interaction.options.getMember('пользователь');
    const reason = interaction.options.getString('причина') || 'Не соответствуете требованиям';

    // Обновление статуса заявки
    const applications = loadApplications();
    for (const [appId, app] of Object.entries(applications)) {
        if (app.userId === user.id) {
            app.status = 'rejected';
            app.rejectReason = reason;
            app.rejectedBy = interaction.user.tag;
            app.rejectedAt = new Date().toISOString();
            break;
        }
    }
    saveApplications(applications);

    // Сообщение в канал
    const rejectEmbed = new EmbedBuilder()
        .setColor(COLORS.BLACK)
        .setDescription(
            `# ✗ ЗАЯВКА ОТКЛОНЕНА\n\n` +
            `Заявка **${user}** отклонена\n\n` +
            `Причина: \`${reason}\`\n` +
            `─────────────────────\n` +
            `Администратор: ${interaction.user}`
        );

    await interaction.reply({ embeds: [rejectEmbed] });

    console.log(`✗ Заявка отклонена: ${user.user.tag} (админ: ${interaction.user.tag})`);

    // ЛС пользователю
    try {
        const dmEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription(
                `# ✗ ЗАЯВКА ОТКЛОНЕНА\n\n` +
                `─────────────────────\n\n` +
                `**Причина:** ${reason}\n\n` +
                `Вы можете подать заявку повторно\n` +
                `после устранения недостатков\n` +
                `─────────────────────`
            );

        await user.send({ embeds: [dmEmbed] });
    } catch (error) {
        console.log('⚠️ Не удалось отправить ЛС пользователю');
    }
}

// Команда: инфо
async function handleInfo(interaction) {
    const infoEmbed = new EmbedBuilder()
        .setColor(COLORS.WHITE)
        .setDescription(
            `# FOREVER FAMILY\n` +
            `─────────────────────\n\n` +
            `### Мы — семья, построенная на доверии\n\n` +
            `**Наши принципы:**\n` +
            `▫️ Взаимопомощь и поддержка\n` +
            `▫️ Дисциплина и порядок\n` +
            `▫️ Активность в игре\n` +
            `▫️ Уважение к членам семьи\n\n` +
            `**Как вступить:**\n` +
            `Используй команду </заявка:0>\n` +
            `─────────────────────`
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'Forever Family • GTA 5 RP' });

    await interaction.reply({ embeds: [infoEmbed] });
}

// Команда: статистика
async function handleStats(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const errorEmbed = new EmbedBuilder()
            .setColor(COLORS.BLACK)
            .setDescription('❌ Недостаточно прав');
        
        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const applications = loadApplications();
    const stats = {
        total: Object.keys(applications).length,
        pending: Object.values(applications).filter(app => app.status === 'pending').length,
        accepted: Object.values(applications).filter(app => app.status === 'accepted').length,
        rejected: Object.values(applications).filter(app => app.status === 'rejected').length
    };

    const statsEmbed = new EmbedBuilder()
        .setColor(COLORS.WHITE)
        .setDescription(
            `# 📊 СТАТИСТИКА ЗАЯВОК\n` +
            `─────────────────────\n\n` +
            `**Всего заявок:** \`${stats.total}\`\n\n` +
            `⏳ На рассмотрении: \`${stats.pending}\`\n` +
            `✅ Принято: \`${stats.accepted}\`\n` +
            `❌ Отклонено: \`${stats.rejected}\`\n` +
            `─────────────────────`
        );

    await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
}

// Обработка ошибок
process.on('unhandledRejection', error => {
    console.error('✗ Необработанная ошибка:', error);
});

// Запуск бота
if (config.token === 'ВАШ_ТОКЕН_БОТА') {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ОШИБКА: Токен бота не установлен!');
    console.error('');
    console.error('Откройте файл config.js и замените');
    console.error('"ВАШ_ТОКЕН_БОТА" на реальный токен');
    console.error('');
    console.error('Получить токен: https://discord.com/developers/applications');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
}

client.login(config.token).catch(error => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ОШИБКА: Не удалось запустить бота');
    console.error('');
    console.error('Проверьте токен бота в config.js');
    console.error('');
    console.error('Ошибка:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
