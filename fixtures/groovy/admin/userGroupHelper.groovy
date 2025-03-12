import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaGroupManagerService
import org.jahia.services.usermanager.JahiaUserManagerService
import javax.jcr.RepositoryException

JahiaGroupManagerService groupManagerService = JahiaGroupManagerService.getInstance();

JCRTemplate.getInstance().doExecuteWithSystemSession(session -> {
    String operation = "OPERATION";
    String groupName = "GROUPNAME"
    String siteKey = "SITEKEY".equals("") ? null : "SITEKEY";
    boolean hidden = Boolean.parseBoolean("HIDDEN")
    log.info("{} : {}", operation, groupName)
    switch (operation) {
        case "create":
            groupManagerService.createGroup(siteKey, groupName, null, hidden,  session)
            break;
        case "delete":
            def group = groupManagerService.lookupGroup(siteKey, groupName);
            if (group != null) {
                groupManagerService.deleteGroup(group.getPath(), session)
            }
            break;
    }
    session.save()
    return null
})