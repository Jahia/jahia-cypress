import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaUserManagerService
import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
        log.info("Delete user : USER_NAME" );

        JahiaUserManagerService userManagerService = JahiaUserManagerService.getInstance();
        try {
            userManagerService.deleteUser(userManagerService.getUserPath("USER_NAME"), session);
            session.save();
        } catch (Throwable e) {
            log.warn("Cannot delete user USER_NAME because {}", e.getMessage())
        }
        return null;
    }
})
