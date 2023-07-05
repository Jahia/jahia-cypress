import org.jahia.api.Constants
import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaUserManagerService
import org.jahia.services.workflow.WorkflowService
import org.jahia.services.workflow.WorkflowTask


def rootUser = JahiaUserManagerService.instance.lookupUser("root").getJahiaUser()
def workflowService = WorkflowService.getInstance();
JCRTemplate.instance.doExecuteWithSystemSessionAsUser(rootUser,
        Constants.EDIT_WORKSPACE, Locale.ENGLISH, jcrsession -> {
    List<WorkflowTask> tasks = workflowService.getTasksForUser(rootUser, Locale.ENGLISH)
    tasks.forEach(task -> workflowService.assignAndCompleteTask(task.getId(), task.getProvider(), "accept", null, rootUser))
    log.info("Validate {} workflows task(s)", tasks.size());
    return null;
});