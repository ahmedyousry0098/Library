import nodeMailer from 'nodemailer'

export const sendEmail = async ({to='', subject, htmlTemp}) => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER_NAME,
            pass: process.env.MAIL_PASSWORD
        }
    })

    const EmailInfo = await transporter.sendMail({
        from: `"Ahmed Yousry 🧑‍🦰" <${process.env.MAIL_USER_NAME}>`,
        to,
        subject,
        html: htmlTemp
    })

    if (!EmailInfo.accepted.length) return false
    return true
}
