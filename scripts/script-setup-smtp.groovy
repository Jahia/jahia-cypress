import org.jahia.bin.Jahia
import org.jahia.osgi.BundleUtils
import org.jahia.services.mail.MailService
import org.jahia.services.mail.MailSettings
import org.osgi.service.cm.ConfigurationAdmin

def smtpServerUrlEnv = System.getenv("SMTP_SERVER_URL")
if (!smtpServerUrlEnv) {
    log.info("SMTP_SERVER_URL is not set, skipping SMTP configuration.")
    return
}

def smtpServerUrl = new URI(smtpServerUrlEnv)
def useSsl = smtpServerUrl.getScheme().equalsIgnoreCase("smtps")

// mail-service (org.jahia.modules.mail PID) replaces the legacy MailService starting 8.2.4.0.
def mailServiceModuleAvailable = new org.jahia.commons.Version(Jahia.VERSION)
        .compareTo(new org.jahia.commons.Version("8.2.4.0")) >= 0

if (mailServiceModuleAvailable) {
    def props = new Hashtable<String, Object>()
    props.put("smtp.host", smtpServerUrl.getHost())
    props.put("smtp.port", String.valueOf(smtpServerUrl.getPort()))
    // Mailpit accepts unauthenticated plain SMTP, so no auth is required.
    props.put("smtp.auth", "false")
    props.put("smtp.starttls", "false")
    props.put("smtp.ssl", String.valueOf(useSsl))
    props.put("default.from", "noreply@smtp-server.localhost")

    def configAdmin = BundleUtils.getOsgiService(ConfigurationAdmin.class, null)
    // "?" is a multi-location bind: the configuration is delivered to whichever bundle registers
    // mail-service's DS component for this PID, regardless of which bundle created/updated it here.
    // A plain getConfiguration(pid) binds the location to the calling bundle (the console/system
    // bundle), which mail-service's component never receives.
    configAdmin.getConfiguration("org.jahia.modules.mail", "?").update(props)
} else {
    MailSettings mailSettings = new MailSettings()
    mailSettings.setServiceActivated(true)
    mailSettings.setUri(smtpServerUrlEnv)
    mailSettings.setFrom("noreply@smtp-server.localhost")
    mailSettings.setTo("admin@smtp-server.localhost")
    MailService.getInstance().store(mailSettings)
}
