import transporter from '../config/nodemailer.js';
import { SECURITY_ALERT_USER_TEMPLATE } from '../config/emailTemplates.js';

export const sendUserSecurityAlert = async ({
    email,
    name,
    action,
    reason,
    ip
}) => {
    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: '🚨 Security Alert – Caravan Chronicle',
        html: SECURITY_ALERT_USER_TEMPLATE
            .replace('{{name}}', name)
            .replace('{{action}}', action)
            .replace('{{reason}}', reason)
            .replace('{{ip}}', ip)
            .replace('{{time}}', new Date().toLocaleString())
    });
};
