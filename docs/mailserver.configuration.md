Jahia-cypress handles both legacy and modern OSGi mail services, so you shouldn't care about manual configuration.
To configure mail server support in your repo to be able to receive Jahia mails and notifications, please follow these steps:

1. Update services in  `docker-compose.yml` file:
  - add mailpit container to the services list
  - add dependency on the mailpit container to the jahia and cypress services
  - propagate MAILPIT_URL variable to the cypress container to operate with mailpit APIs
  - propagate SMTP_SERVER_URL variable to the jahia container; it will be used by provisioning script later on to configure mail server in Jahia

```yaml
services:
    jahia:
        image: '${JAHIA_IMAGE}'
        container_name: jahia
        depends_on:
            # add dependency on just added smtp-server container
            - smtp-server
        ...
        environment:
            ...
            # to be used by groovy script going forward to configure SMTP for Jahia instance
            # note - domain corresponds to smtp-server's container name
            - SMTP_SERVER_URL=smtp://smtp-server:1025    
    ...
    ...
    cypress:
        image: '${TESTS_IMAGE}'
        depends_on:
            # add dependency on just added smtp-server container
            - smtp-server
        ...
        environment: 
            ...
            # to be used by cypress tests to operate with mailpit APIs
            # note - domain corresponds to smtp-server's container name
            - MAILPIT_URL=http://smtp-server:8025
    ...
    ...    
    # smtp container itself    
    smtp-server:
        image: axllent/mailpit:v1.27
        container_name: smtp-server
        ports:
            - '1025:1025' # SMTP
            - '8025:8025' # web UI
        networks:
            # networking should be the same with existing services
            - stack
```

2. Update you `@jahia/cypress` module to the latest version (>= 8.2.1) which contains mailpit support and mail server configuration script for Jahia.
3. In your `tests/cypress/support/e2e.js` file, add the following line to import mailpit support and configure mail server in Jahia:

```javascript
import {setupSmtp} from '@jahia/cypress';

// Configure SMPT in Jahia instance to be able to send emails and notifications
setupSmtp();
```

4. Update .env.example file to include MAILPIT_URL variable to allow local cypress debugging.
   Note - `localhost` is referenced here, because local cypress process can't refer to container name. While in compose file we used smtp-server for the same, to allow containers talk to each other.

```bash
MAILPIT_URL=${MAILPIT_URL:-http://localhost:8025}

```
After this setup, global before() hook will be added to your specs, which will configure mail server in Jahia instance and clean up mailpit before each test run. You can now use mailpit APIs to check for received emails and notifications in your tests.

SMTP configuration will be done only once before the first test run, and will be skipped for subsequent test runs.
Setup will be skipped if:
- mailpit service doesn't respond (e.g. not started or not reachable).
- `SMTP_SERVER_URL` environment variable is not set in the jahia container.
