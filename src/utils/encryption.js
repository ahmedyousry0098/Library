import bcrypt from 'bcryptjs'

export const hashPassword = ({plainPassword = "", saltRounds = process.env.SALT_ROUNDS}) => {
    const salt = bcrypt.genSaltSync(Number(saltRounds))
    const hashedPassword = bcrypt.hashSync(plainPassword, salt)

    if (!hashedPassword) return false;

    return hashedPassword
}

export const comparePassword = ({password='', reference=''}) => {
    const isMatch = bcrypt.compareSync(password, reference)
    return isMatch
}