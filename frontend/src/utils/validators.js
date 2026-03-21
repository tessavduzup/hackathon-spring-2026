export const validatePassword = (value) => {
    const response = {success: false, error: ''}
    if (value.length < 8) {
        response.error = 'Пароль должен быть минимум 8 символов';
        return response;
    } else if (!/[A-Z]/.test(value)) {
        response.error = 'Пароль должен содержать хотя бы одну заглавную букву';
        return response;
    } else if (!/[a-z]/.test(value)) {
        response.error = 'Пароль должен содержать хотя бы одну строчную букву';
        return response;
    } else if (!/[0-9]/.test(value)) {
        response.error = 'Пароль должен содержать хотя бы одну цифру';
        return response;
    }

    response.success = true
    return response;
};

export const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(ru|com|net|org|kz|by|ua)$/i;
    if (!emailRegex.test(value)) {
        return {success: false, error: 'Введите корректный email адрес'};
    }
    return {success: true};
};

export const validateFIO = (value) => {
    if (value.length < 2) {
        return {success: false, error: 'Минимум 2 символа'};
    } else if (!/^[А-ЯЁ][а-яА-ЯёЁ]+$/.test(value)) {
        return {success: false, error: 'Может содержать только буквы, пробелы и дефисы'};
    }
    return {success: true};
};

export default {
    validatePassword,
    validateEmail,
    validateFIO
};