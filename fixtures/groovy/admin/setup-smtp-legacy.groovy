import org.jahia.services.mail.MailService
import org.jahia.services.mail.MailSettings

// Jahia <= 8.2.3.0 (the current Release Latest image) has no mail-service module: the org.jahia.modules.mail
// config above is inert there, and mail goes through the legacy MailService. Keep configuring it so the
// same asset works on both channels. On 8.2.4.0+ this legacy call is a functional no-op (mail-service owns
// sending), so it does not cause a double send. Remove this block once Release Latest reaches 8.2.4.0.
MailSettings mailSettings = new MailSettings()
mailSettings.setServiceActivated(true)
mailSettings.setUri(System.getenv("SMTP_SERVER_URL"))
mailSettings.setFrom("noreply@smtp-server.localhost")
mailSettings.setTo("admin@smtp-server.localhost")
MailService.getInstance().store(mailSettings)
