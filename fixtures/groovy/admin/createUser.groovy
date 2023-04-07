import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaUserManagerService
import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
        log.info("Create user : USER_NAME")
        JahiaUserManagerService userManagerService = JahiaUserManagerService.getInstance()

        Properties properties = new Properties()
        USER_PROPERTIES

        userManagerService.createUser("USER_NAME", null, "PASSWORD", properties, session)
        session.save()
        return null
    }
})