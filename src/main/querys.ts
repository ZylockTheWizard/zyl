
export const userQuery = (id: string) => {
    return `
        SELECT * FROM users
        WHERE id = '${id}'
    `
}