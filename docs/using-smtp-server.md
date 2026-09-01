Jahia-cypress handles both _legacy_ and _modern OSGi_ mail services, so you shouldn't care about manual configuration.
To configure mail server support in your repo to be able to receive Jahia mails and notifications, please follow these steps:

1. Update you `@jahia/cypress` module to the latest version (> 8.4.0) which contains `mailpit` support and mail server configuration script for Jahia.
2. Update services in  `docker-compose.yml` file:
   - add `mailpit` container to the services list
   - add dependency on the `mailpit` container to the `jahia` and `cypress` services
   - propagate `MAILPIT_URL` variable to the `cypress` container to operate with `mailpit` APIs
   - propagate `SMTP_SERVER_URL` variable to the `jahia` container; it will be used by provisioning script later on to configure mail server in Jahia

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
3. Update `.env.example` file in your repo to include `MAILPIT_URL` variable to allow local cypress debugging.
   Note - `localhost` is referenced here, because local cypress process can't refer to container name. While in compose file `smtp-server` was used for the same, to allow containers talk to each other.

    ```bash
    MAILPIT_URL=${MAILPIT_URL:-http://localhost:8025}
    
    ```

SMTP configuration will be done automatically by provisioning script, stored in `jahia-cypress` repo once other provisioning calls will be completed.
Setup will be skipped if `SMTP_SERVER_URL` environment variable is not propagated to your environment in the `jahia` container.
