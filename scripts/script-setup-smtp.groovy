/**
 * This script configures the SMTP server for Jahia based on the SMTP_SERVER_URL environment variable.
 * It supports both the legacy MailService and the newer OSGi mail-service module.
 * Script is skipped if the SMTP_SERVER_URL environment variable is not set.
 */
import org.jahia.osgi.BundleUtils
import org.jahia.services.mail.MailService
import org.jahia.services.mail.MailSettings
import org.osgi.service.cm.ConfigurationAdmin

def smtpServerUrlEnv = System.getenv("SMTP_SERVER_URL")
if (!smtpServerUrlEnv) {
    log.info("[jahia-cypress-provisioning] SMTP_SERVER_URL is not set, skipping SMTP configuration.")
    return
} else {
    log.info("[jahia-cypress-provisioning] Configuring SMTP server with URL: {}", smtpServerUrlEnv)
}

def smtpServerUrl = new URI(smtpServerUrlEnv)
def useSsl = smtpServerUrl.getScheme().equalsIgnoreCase("smtps")

// mail-service (org.jahia.modules.mail PID) replaces the legacy MailService once Jahia core ships the
// org.jahia.api.mail API: from 8.2.4.0, and from 8.2.3.8 on the 8.2.3.x line. The legacy store() does
// nothing from then on, so the presence of the API decides, not the version number.
def mailServiceModuleAvailable
try {
    Class.forName("org.jahia.api.mail.MailService", false, MailService.class.classLoader)
    mailServiceModuleAvailable = true
} catch (ClassNotFoundException ignored) {
    mailServiceModuleAvailable = false
}

if (mailServiceModuleAvailable) {
    def props = new Hashtable<String, Object>()
    props.put("smtp.host", smtpServerUrl.getHost())
    props.put("smtp.port", String.valueOf(smtpServerUrl.getPort()))
    // Mailpit accepts unauthenticated plain SMTP, so no auth is required.
    props.put("smtp.auth", "false")
    props.put("smtp.starttls", "false")
    props.put("smtp.ssl", String.valueOf(useSsl))
    props.put("default.from", "noreply@smtp-server.localhost")
    // Counterpart of the legacy setTo below: mail-service sends a message with no to/cc/bcc, such as
    // a Jahia system notification, to this address.
    props.put("default.recipient", "admin@smtp-server.localhost")

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
