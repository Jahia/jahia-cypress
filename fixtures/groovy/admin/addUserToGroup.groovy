import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaGroupManagerService
import org.jahia.services.usermanager.JahiaUserManagerService
import org.jahia.services.content.decorator.JCRGroupNode
import org.jahia.services.content.decorator.JCRUserNode

log.info("Add user USERNAME to group GROUPNAME")
String siteKey = "SITEKEY".equals("") ? null : "SITEKEY";
JCRTemplate.getInstance().doExecuteWithSystemSession(session -> {
    JahiaUserManagerService userManagerService = JahiaUserManagerService.getInstance()
    JahiaGroupManagerService groupManagerService = JahiaGroupManagerService.getInstance()
    JCRGroupNode groupNode = groupManagerService.lookupGroup(siteKey, "GROUPNAME", session)
    JCRUserNode userNode = userManagerService.lookupUser("USERNAME")
    if (!groupNode.isMember(userNode)) {
        groupNode.addMember(userNode)
    }
    session.save()
})
