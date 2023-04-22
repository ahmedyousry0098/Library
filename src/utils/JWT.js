import jwt from 'jsonwebtoken'

export const generateJWT = ({payload={}, signature=process.env.TOKEN_SIGNATURE, expiresIn=60*60}) => {
    if (!Object.keys(payload).length) return false
    const token = jwt.sign(payload, signature, {expiresIn})
    return token
}

export const decodeJWT = ({token='', signature=process.env.TOKEN_SIGNATURE}) => {
    if (!token || typeof token !== 'string' || !token.startsWith(process.env.TOKEN_PREFIX)) return false
    const pureToken = token.replace(process.env.TOKEN_PREFIX, "")
    const decoded = jwt.verify(pureToken, signature)
    return decoded
}