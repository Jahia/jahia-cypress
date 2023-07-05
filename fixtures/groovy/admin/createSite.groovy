import org.jahia.api.Constants
import org.jahia.services.content.JCRTemplate
import org.jahia.services.content.decorator.JCRSiteNode
import org.jahia.services.sites.JahiaSite
import org.jahia.services.sites.JahiaSitesService
import org.jahia.services.sites.SiteCreationInfo
import org.jahia.services.usermanager.JahiaUserManagerService
import java.util.stream.Collectors

JahiaSitesService sitesService = JahiaSitesService.getInstance();
if (sitesService.getSiteByKey("SITEKEY") == null) {
    JahiaSite site = sitesService.addSite(SiteCreationInfo.builder().
            siteKey("SITEKEY").
            serverName("SERVERNAME").
            title("SITEKEY").
            templateSet("TEMPLATES_SET").
            locale("LOCALE").build())

    JCRTemplate.instance.doExecuteWithSystemSessionAsUser(JahiaUserManagerService.instance.lookupUser("root").jahiaUser,
            Constants.EDIT_WORKSPACE, Locale.ENGLISH, jcrsession -> {
        JCRSiteNode siteByKey = sitesService.getSiteByKey("SITEKEY", jcrsession)
        siteByKey.setLanguages(Arrays.stream("LANGUAGES".split(",")).map(String::trim).collect(Collectors.toSet()))
        jcrsession.save()
        return null
    })
}
