import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaUserManagerService
import javax.jcr.RepositoryException

JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
        log.info("Delete user : USERNAME" );

        JahiaUserManagerService userManagerService = JahiaUserManagerService.getInstance();
        def user = userManagerService.getUserPath("USERNAME");
        if (user) {
            userManagerService.deleteUser(user, session);
            session.save();
        } else {
            log.warn("User USERNAME cannot be deleted. User not found");
        }
        return null;
    }
})
