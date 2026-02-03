// Конфигурация бота Forever Family
module.exports = {
    // Токен бота Discord
    // Получить токен: https://discord.com/developers/applications
    token: 'ВАШ_ТОКЕН_БОТА',

    // ID каналов
    channels: {
        welcome: '1234567890',      // Канал приветствий
        applications: '1234567891'  // Канал заявок
    },

    // ID ролей
    roles: {
        auto: '1234567892',    // Роль для автовыдачи новым участникам
        member: '1234567893'   // Роль участника семьи (выдается при принятии)
    },

    // Настройки заявок
    application: {
        minAge: 14,           // Минимальный возраст
        minReasonLength: 20   // Минимальная длина причины
    },

    // Настройки бота
    bot: {
        activity: 'Forever Family',     // Текст статуса
        activityType: 'WATCHING'        // Тип активности: PLAYING, WATCHING, LISTENING, COMPETING
    }
};