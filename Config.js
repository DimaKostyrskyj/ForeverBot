// Конфигурация бота Forever Family
// Используем переменные окружения для безопасности

module.exports = {
    // Токен бота Discord
    // Получить токен: https://discord.com/developers/applications
    token: process.env.DISCORD_TOKEN || 'MTQ2ODI1Mzc5MjUyODIzNjcwMg.GRRWhL.Sqxo6UaUnXzmCqFn2J5o2Yx3vQv0icBZU9JEUs',

    // ID каналов
    channels: {
        welcome: process.env.WELCOME_CHANNEL_ID || '1458206399459885174',      // Канал приветствий
        applications: process.env.APPLICATIONS_CHANNEL_ID || '1458206399459885170'  // Канал заявок
    },

    // ID ролей
    roles: {
        auto: process.env.AUTO_ROLE_ID || '1468254162092560558',    // Роль для автовыдачи новым участникам
        member: process.env.MEMBER_ROLE_ID || '1458206393260708049'   // Роль участника семьи (выдается при принятии)
    },

    // Настройки заявок
    application: {
        minAge: parseInt(process.env.MIN_AGE) || 16,           // Минимальный возраст
        minReasonLength: parseInt(process.env.MIN_REASON_LENGTH) || 20   // Минимальная длина причины
    },

    // Настройки бота
    bot: {
        activity: process.env.BOT_ACTIVITY || 'Forever Family',     // Текст статуса
        activityType: process.env.BOT_ACTIVITY_TYPE || 'WATCHING'        // Тип активности: PLAYING, WATCHING, LISTENING, COMPETING
    }
};
