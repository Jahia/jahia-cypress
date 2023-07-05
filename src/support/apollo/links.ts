/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {HttpLink} from '@apollo/client/link/http';
import fetch from 'cross-fetch';
import {setContext} from '@apollo/client/link/context';

interface ApolloRequestInit extends RequestInit {
    formData?: FormData
}

export const formDataHttpLink = (baseUrl: string, headers: unknown) => {
    return new HttpLink({
        uri: `${baseUrl}/modules/graphql`,
        headers,
        fetch: (uri, fetcherOptions) => {
            const options: ApolloRequestInit = {...fetcherOptions};
            if (options.formData) {
                const formData = options.formData;
                const body = JSON.parse(options.body.toString());
                if (Array.isArray(body)) {
                    formData.append('query', options.body.toString());
                } else {
                    Object.keys(body).forEach(k =>
                        formData.append(k, typeof body[k] === 'string' ? body[k] : JSON.stringify(body[k]))
                    );
                }

                fetcherOptions.body = formData;
                delete fetcherOptions.headers['content-type'];
                return fetch(uri, fetcherOptions);
            }

            return fetch(uri, fetcherOptions);
        }
    });
};

export const uploadLink = setContext((operation, {fetchOptions}) => {
    const {variables} = operation;
    let fileFound = false;
    const formData = new FormData();
    const id = Math.random().toString(36);
    // Search for File objects on the request and set it as formData
    Object.keys(variables).forEach(function (k) {
        const variable = variables[k];
        if (variable instanceof File) {
            formData.append(id, variable);
            variables[k] = id;
            fileFound = true;
        }
    });
    if (fileFound) {
        return {
            fetchOptions: {
                ...fetchOptions,
                formData: formData
            }
        };
    }

    return {
        fetchOptions: {
            ...fetchOptions
        }
    };
});
