import org.jahia.osgi.BundleUtils
import org.osgi.service.cm.ConfigurationAdmin

def smtpServerUrl = new URI(System.getenv("SMTP_SERVER_URL"))
def useSsl = smtpServerUrl.getScheme().equalsIgnoreCase("smtps")

// Jahia 8.2.4.0+ sends mail through the mail-service module (org.jahia.modules.mail PID).
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
