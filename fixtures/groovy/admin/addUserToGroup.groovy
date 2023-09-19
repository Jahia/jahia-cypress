import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaGroupManagerService
import org.jahia.services.usermanager.JahiaUserManagerService
import org.jahia.services.content.decorator.JCRGroupNode
import org.jahia.services.content.decorator.JCRUserNode

log.info("Add user USER_NAME to group GROUP_NAME")
JCRTemplate.getInstance().doExecuteWithSystemSession(session -> {
    JahiaUserManagerService userManagerService = JahiaUserManagerService.getInstance()
    JahiaGroupManagerService groupManagerService = JahiaGroupManagerService.getInstance()
    JCRGroupNode groupNode = groupManagerService.lookupGroup(SITE_KEY, "GROUP_NAME", session)
    JCRUserNode userNode = userManagerService.lookupUser("USER_NAME")
    if (!groupNode.isMember(userNode)) {
        groupNode.addMember(userNode)
    }
    session.save()
})
