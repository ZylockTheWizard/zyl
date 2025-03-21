export const areEqual = (a: string | undefined, b: string | undefined) =>
    a?.toLowerCase() === b?.toLowerCase()

export const isMaster = () => window.zylSession.userData.master === 1

export const camelCaseToTitleCase = (camelCaseString: string) =>
    camelCaseString.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
