// Конфигурация бота Forever Family
module.exports = {
    // Токен бота Discord
    // Получить токен: https://discord.com/developers/applications
    token: 'MTQ2ODI1Mzc5MjUyODIzNjcwMg.GRRWhL.Sqxo6UaUnXzmCqFn2J5o2Yx3vQv0icBZU9JEUs',

    // ID каналов
    channels: {
        welcome: '1458206399459885174',      // Канал приветствий
        applications: '1458206399459885170'  // Канал заявок
    },

    // ID ролей
    roles: {
        auto: '1468254162092560558',    // Роль для автовыдачи новым участникам
        member: '1458206393260708049'   // Роль участника семьи (выдается при принятии)
    },

    // Настройки заявок
    application: {
        minAge: 16,           // Минимальный возраст
        minReasonLength: 20   // Минимальная длина причины
    },

    // Настройки бота
    bot: {
        activity: 'Forever Family',     // Текст статуса
        activityType: 'WATCHING'        // Тип активности: PLAYING, WATCHING, LISTENING, COMPETING
    }
};