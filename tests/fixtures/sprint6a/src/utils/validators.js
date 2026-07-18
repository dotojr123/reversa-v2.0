export function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

export function validateAmount(amount) {
    return amount > 0;
}
