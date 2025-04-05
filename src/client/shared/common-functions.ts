export const areEqual = (a: string | undefined, b: string | undefined) =>
    a?.toLowerCase() === b?.toLowerCase()

export const isMaster = () => {
    const id = window.zylSession.userData.id
    const user = window.zylSession.currentUsers.find((u) => areEqual(u.id, id))
    return user.master === 1
}

export const camelCaseToTitleCase = (camelCaseString: string) =>
    camelCaseString.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
