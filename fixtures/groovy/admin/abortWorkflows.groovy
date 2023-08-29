import org.jahia.services.usermanager.JahiaUser
import org.jahia.services.usermanager.JahiaUserManagerService
import org.jahia.services.workflow.Workflow
import org.jahia.services.workflow.WorkflowService
import org.jahia.services.workflow.WorkflowTask

final JahiaUser user = JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser();
List<WorkflowTask> tasks = WorkflowService.getInstance().getTasksForUser(user, Locale.ENGLISH);
for (WorkflowTask task : tasks) {
    Workflow w = WorkflowService.getInstance().getWorkflow(task.getProvider(), task.getProcessId(), Locale.ENGLISH);
    WorkflowService.getInstance().abortProcess(w.getId(), w.getProvider());
}
