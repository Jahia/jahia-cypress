import {NodeSSH, SSHExecCommandResponse} from 'node-ssh';

interface connection {
    hostname: string
    port: string
    username: string
    password: string
}

/**
 * Execute SSH commands on a specific host. Returns a promise that resolves to the command result.
 * Rejects if the commands fail (exit code is not 0).
 * @param commands Array of SSH commands to execute
 * @param connection Connection details
 */
export const sshCommands = (commands: Array<string>, connection: connection): Promise<SSHExecCommandResponse> => {
    return new Promise((resolve, reject) => {
        const ssh = new NodeSSH();
        console.info('[SSH] connection to:', connection.hostname, ' (port: ', connection.port, ')');
        console.info('[SSH] commands:', commands);
        console.info('[SSH] ', connection);
        ssh.connect({
            host: connection.hostname,
            port: parseInt(connection.port, 10),
            username: connection.username,
            password: connection.password
        })
            .then(() => {
                ssh.exec(commands.join(';'), [], {stream: 'both'})
                    .then(function (result) {
                        console.info('[SSH] Successfully executed commands: ', commands);
                        console.info('[SSH] Result: ', result);
                        if (result.code === 0) {
                            resolve(result); // Resolve to command result
                        } else {
                            reject(new Error(`Commands "${commands}" failed with exit code ${result.code} on host ${connection.hostname}. Stdout:${result.stdout}, Stderr: ${result.stderr}`));
                        }
                    })
                    .catch(reason => {
                        console.error('[SSH] Failed to execute commands: ', commands);
                        reject(reason);
                    });
            })
            .catch(reason => {
                console.error('[SSH] Failed to connect to: ', connection.hostname);
                reject(reason);
            });
    });
};
