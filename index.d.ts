/**
  The login function will login

  @param {object} [options] - Options object for the login function
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.token] - auth token to pass into the openshift rest client for logging in with the API Server.  Overrides the username/password
  @param {string} [options.username] - username to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.password] - password to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.apiServer] - use server instead. apiServer to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.server] - server to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.insecure] - flag to pass into the openshift rest client for logging in with a self signed cert.  Only used with apiServer login.  default to false
  @param {string} [options.forceLogin] - Force a login when using the apiServer login.  Only used with apiServer login.  default to false
  @returns {Promise<object>} - Returns a JSON Object
*/
export function login(options?: {
    projectLocation?: string;
    token?: string;
    username?: string;
    password?: string;
    apiServer?: string;
    server?: string;
    insecure?: string;
    forceLogin?: string;
}): Promise<object>;
/**
  The logout function will logout

  @param {object} [options] - Options object for the logout function
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
*/
export function logout(options?: {
    projectLocation?: string;
}): any;
/**
  The deploy function will do the combination of resource, build and apply-resource

  @param {object} [options] - Options object for the deploy function
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.token] - auth token to pass into the openshift rest client for logging in with the API Server.  Overrides the username/password
  @param {string} [options.username] - username to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.password] - password to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.apiServer] - Deprecated - use server instead. apiServer to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.server] - server to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.insecure] - flag to pass into the openshift rest client for logging in with a self signed cert.  Only used with apiServer login.  default to false
  @param {string} [options.forceLogin] - Force a login when using the apiServer login.  Only used with apiServer login.  default to false
  @param {boolean} [options.expose] - Set to true to create a default Route and expose the default service.  defaults to false
  @param {string} [options.exposeHost] - Alias/DNS that points to the service. Must be used with expose
  @param {object} [options.namespace] -
  @param {string} [options.namespace.displayName] - flag to specify the project namespace display name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {boolean} [options.namespace.create] - flag to create the namespace if it does not exist. Only applicable for the build and deploy command. Must be used with namespace.name
  @param {string} [options.namespace.name] - flag to specify the project namespace name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {string} [options.resourceProfile] - Define a subdirectory below .nodeshift/ that indicates where Openshift resources are stored
  @param {string} [options.imageTag] - set the version to use for the ubi8/nodejs-14.  Versions are ubi8/nodejs-14 tags: https://access.redhat.com/containers/?tab=tags#/registry.access.redhat.com/ubi8/nodejs-14
  @param {string} [options.outputImageStream] - the name of the ImageStream to output to.  Defaults to project name from package.json
  @param {string} [options.outputImageTag] - The tag of the ImageStream to output to. Defaults to latest
  @param {boolean} [options.quiet] - suppress INFO and TRACE lines from output logs
  @param {object} [options.deploy] -
  @param {number} [options.deploy.port] - flag to update the default ports on the resource files. Defaults to 8080
  @param {Array} [options.deploy.env] - an array of objects to pass deployment config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {object} [options.build] -
  @param {string} [options.build.strategy] - flag to change the build strategy used.  Values can be Docker or Source.  Defaults to Source
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {Array} [options.build.env] - an array of objects to pass build config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @param {boolean} [options.useDeployment] - Flag to deploy the application using a Deployment instead of a DeploymentConfig. Defaults to false
  @param {boolean} [options.knative] - EXPERIMENTAL. flag to deploy an application as a Knative Serving Service.  Defaults to false
  @param {boolean} [options.kube] - Flag to deploy an application to a vanilla kubernetes cluster.  At the moment only Minikube is supported.  Defaults to false
  @returns {Promise<object>} - Returns a JSON Object
*/
export function deploy(options?: {
    projectLocation?: string;
    token?: string;
    username?: string;
    password?: string;
    apiServer?: string;
    server?: string;
    insecure?: string;
    forceLogin?: string;
    expose?: boolean;
    exposeHost?: string;
    namespace?: {
        displayName?: string;
        create?: boolean;
        name?: string;
    };
    resourceProfile?: string;
    imageTag?: string;
    ImageStream?: string;
    outputImageStream?: string;
    outputImageTag?: string;
    quiet?: boolean;
    deploy?: {
        port?: number;
        env?: any[];
    };
    build?: {
        strategy?: string;
    };
}): Promise<object>;
/**
  The resource function will find and enrich all the resource fragments from the .nodeshift directory and create missing service and deployment configs.
  An openshift.yaml and openshift.json will also be created in the ./tmp/nodeshift/resource directory

  @param {object} [options] - Options object for the resource function
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.token] - auth token to pass into the openshift rest client for logging in with the API Server.  Overrides the username/password
  @param {string} [options.username] - username to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.password] - password to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.apiServer] - Deprecated - use server instead. apiServer to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.server] - server to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.insecure] - flag to pass into the openshift rest client for logging in with a self signed cert.  Only used with apiServer login.  default to false
  @param {string} [options.forceLogin] - Force a login when using the apiServer login.  Only used with apiServer login.  default to false
  @param {boolean} [options.expose] - Set to true to create a default Route and expose the default service.  defaults to false
  @param {string} [options.exposeHost] - Alias/DNS that points to the service. Must be used with expose
  @param {object} [options.namespace] -
  @param {string} [options.namespace.displayName] - flag to specify the project namespace display name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {string} [options.namespace.name] - flag to specify the project namespace name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {string} [options.resourceProfile] - Define a subdirectory below .nodeshift/ that indicates where Openshift resources are stored
  @param {string} [options.imageTag] - set the version to use for the ubi8/nodejs-14.  Versions are ubi8/nodejs-14 tags: https://access.redhat.com/containers/?tab=tags#/registry.access.redhat.com/ubi8/nodejs-14
  @param {string} [options.dockerImage] - set the s2i Node.js docker image to use. The current default is ubi8/nodejs-14.
  @param {string} [options.imageStream] - the image stream from which to get the Node.js s2i image to use. If not specified defaults to useing a Node.js docker image instead.
  @param {string} [options.outputImageStream] - the name of the ImageStream to output to.  Defaults to project name from package.json
  @param {string} [options.outputImageTag] - The tag of the ImageStream to output to. Defaults to latest
  @param {boolean} [options.quiet] - suppress INFO and TRACE lines from output logs
  @param {object} [options.build] -
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @param {boolean} [options.useDeployment] - Flag to deploy the application using a Deployment instead of a DeploymentConfig. Defaults to false
  @param {boolean} [options.knative] - EXPERIMENTAL. flag to deploy an application as a Knative Serving Service.  Defaults to false
  @param {boolean} [options.kube] - Flag to deploy an application to a vanilla kubernetes cluster.  At the moment only Minikube is supported.  Defaults to false
  @returns {Promise<object>} - Returns a JSON Object
*/
export function resource(options?: {
    projectLocation?: string;
    token?: string;
    username?: string;
    password?: string;
    apiServer?: string;
    server?: string;
    insecure?: string;
    forceLogin?: string;
    expose?: boolean;
    exposeHost?: string;
    namespace?: {
        displayName?: string;
        name?: string;
    };
    resourceProfile?: string;
    imageTag?: string;
    outputImageStream?: string;
    outputImageTag?: string;
    quiet?: boolean;
    build?: object;
}): Promise<object>;
/**
  The apply-resource function does what resource does, but also pushes those resource fragments to your cluster

  @param {object} [options] - Options object for the apply-resource function
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.token] - auth token to pass into the openshift rest client for logging in with the API Server.  Overrides the username/password
  @param {string} [options.username] - username to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.password] - password to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.apiServer] - Deprecated - use server instead. apiServer to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.server] - server to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.insecure] - flag to pass into the openshift rest client for logging in with a self signed cert.  Only used with apiServer login.  default to false
  @param {string} [options.forceLogin] - Force a login when using the apiServer login.  Only used with apiServer login.  default to false
  @param {boolean} [options.expose] - Set to true to create a default Route and expose the default service.  defaults to false
  @param {string} [options.exposeHost] - Alias/DNS that points to the service. Must be used with expose
  @param {object} [options.namespace] -
  @param {string} [options.namespace.displayName] - flag to specify the project namespace display name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {boolean} [options.namespace.create] - flag to create the namespace if it does not exist. Only applicable for the build and deploy command. Must be used with namespace.name
  @param {string} [options.namespace.name] - flag to specify the project namespace name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {string} [options.resourceProfile] - Define a subdirectory below .nodeshift/ that indicates where Openshift resources are stored
  @param {string} [options.imageTag] - set the version to use for the ubi8/nodejs-14.  Versions are ubi8/nodejs-14 tags: https://access.redhat.com/containers/?tab=tags#/registry.access.redhat.com/ubi8/nodejs-14
  @param {string} [options.outputImageStream] - the name of the ImageStream to output to.  Defaults to project name from package.json
  @param {string} [options.outputImageTag] - The tag of the ImageStream to output to. Defaults to latest
  @param {boolean} [options.quiet] - suppress INFO and TRACE lines from output logs
  @param {object} [options.deploy] -
  @param {number} [options.deploy.port] - flag to update the default ports on the resource files. Defaults to 8080
  @param {Array} [options.deploy.env] - an array of objects to pass deployment config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {object} [options.build] -
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @param {boolean} [options.useDeployment] - Flag to deploy the application using a Deployment instead of a DeploymentConfig. Defaults to false
  @param {boolean} [options.knative] - EXPERIMENTAL. flag to deploy an application as a Knative Serving Service.  Defaults to false
  @param {boolean} [options.kube] - Flag to deploy an application to a vanilla kubernetes cluster.  At the moment only Minikube is supported.  Defaults to false
  @returns {Promise<object>} - Returns a JSON Object
*/
export function applyResource(options?: {
    projectLocation?: string;
    token?: string;
    username?: string;
    password?: string;
    apiServer?: string;
    server?: string;
    insecure?: string;
    forceLogin?: string;
    expose?: boolean;
    exposeHost?: string;
    namespace?: {
        displayName?: string;
        create?: boolean;
        name?: string;
    };
    resourceProfile?: string;
    imageTag?: string;
    outputImageStream?: string;
    outputImageTag?: string;
    quiet?: boolean;
    deploy?: {
        port?: number;
        env?: any[];
    };
    build?: object;
}): Promise<object>;
/**
  The undeploy function will use the openshift.yaml/openshift.json from the resource function and remove those values from your cluster.

  @param {object} [options] - Options object for the undeploy function
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.token] - auth token to pass into the openshift rest client for logging in with the API Server.  Overrides the username/password
  @param {string} [options.username] - username to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.password] - password to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.apiServer] - Deprecated - use server instead. apiServer to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.server] - server to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.insecure] - flag to pass into the openshift rest client for logging in with a self signed cert.  Only used with apiServer login.  default to false
  @param {string} [options.forceLogin] - Force a login when using the apiServer login.  Only used with apiServer login.  default to false
  @param {object} [options.namespace] -
  @param {string} [options.namespace.displayName] - flag to specify the project namespace display name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {boolean} [options.namespace.remove] - flag to remove the user created namespace.  Only applicable for the undeploy command.  Must be used with namespace.name
  @param {string} [options.namespace.name] - flag to specify the project namespace name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {string} [options.resourceProfile] - Define a subdirectory below .nodeshift/ that indicates where Openshift resources are stored
  @param {string} [options.imageTag] - set the version to use for the ubi8/nodejs-14.  Versions are ubi8/nodejs-14 tags: https://access.redhat.com/containers/?tab=tags#/registry.access.redhat.com/ubi8/nodejs-14
  @param {string} [options.outputImageStream] - the name of the ImageStream to output to.  Defaults to project name from package.json
  @param {string} [options.outputImageTag] - The tag of the ImageStream to output to. Defaults to latest
  @param {boolean} [options.quiet] - suppress INFO and TRACE lines from output logs
  @param {boolean} [options.removeAll] - option to remove builds, buildConfigs and Imagestreams.  Defaults to false
  @param {object} [options.deploy] -
  @param {number} [options.deploy.port] - flag to update the default ports on the resource files. Defaults to 8080
  @param {Array} [options.deploy.env] - an array of objects to pass deployment config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {object} [options.build] -
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @param {boolean} [options.useDeployment] - Flag to deploy the application using a Deployment instead of a DeploymentConfig. Defaults to false
  @param {boolean} [options.knative] - EXPERIMENTAL. flag to deploy an application as a Knative Serving Service.  Defaults to false
  @param {boolean} [options.kube] - Flag to deploy an application to a vanilla kubernetes cluster.  At the moment only Minikube is supported.  Defaults to false
  @returns {Promise<object>} - Returns a JSON Object
*/
export function undeploy(options?: {
    projectLocation?: string;
    token?: string;
    username?: string;
    password?: string;
    apiServer?: string;
    server?: string;
    insecure?: string;
    forceLogin?: string;
    namespace?: {
        displayName?: string;
        remove?: boolean;
        name?: string;
    };
    resourceProfile?: string;
    imageTag?: string;
    outputImageStream?: string;
    outputImageTag?: string;
    quiet?: boolean;
    removeAll?: boolean;
    deploy?: {
        port?: number;
        env?: any[];
    };
    build?: object;
}): Promise<object>;
/**
  The build function will archive your code, create a BuildConfig and Imagestream and then upload the archived code to your cluster

  @param {object} [options] - Options object for the build function
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.token] - auth token to pass into the openshift rest client for logging in with the API Server.  Overrides the username/password
  @param {string} [options.username] - username to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.password] - password to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.apiServer] - Deprecated - use server instead. apiServer to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.server] - server to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.insecure] - flag to pass into the openshift rest client for logging in with a self signed cert.  Only used with apiServer login.  default to false
  @param {string} [options.forceLogin] - Force a login when using the apiServer login.  Only used with apiServer login.  default to false
  @param {object} [options.namespace] -
  @param {string} [options.namespace.displayName] - flag to specify the project namespace display name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {boolean} [options.namespace.create] - flag to create the namespace if it does not exist. Only applicable for the build and deploy command. Must be used with namespace.name
  @param {string} [options.namespace.name] - flag to specify the project namespace name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {string} [options.imageTag] - set the version to use for the ubi8/nodejs-14.  Versions are ubi8/nodejs-14 tags: https://access.redhat.com/containers/?tab=tags#/registry.access.redhat.com/ubi8/nodejs-14
  @param {string} [options.outputImageStream] - the name of the ImageStream to output to.  Defaults to project name from package.json
  @param {string} [options.outputImageTag] - The tag of the ImageStream to output to. Defaults to latest
  @param {boolean} [options.quiet] - suppress INFO and TRACE lines from output logs
  @param {object} [options.build] -
  @param {string} [options.build.strategy] - flag to change the build strategy used.  Values can be Docker or Source.  Defaults to Source
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {Array} [options.build.env] - an array of objects to pass build config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @param {boolean} [options.kube] - Flag to deploy an application to a vanilla kubernetes cluster.  At the moment only Minikube is supported.  Defaults to false
  @returns {Promise<object>} - Returns a JSON Object
*/
export function build(options?: {
    projectLocation?: string;
    token?: string;
    username?: string;
    password?: string;
    apiServer?: string;
    server?: string;
    insecure?: string;
    forceLogin?: string;
    namespace?: {
        displayName?: string;
        create?: boolean;
        name?: string;
    };
    imageTag?: string;
    outputImageStream?: string;
    outputImageTag?: string;
    quiet?: boolean;
    build?: {
        strategy?: string;
    };
}): Promise<object>;
/**
  The getNodeshiftConfig function will return the config

  @param {object} [options] - Options object for the getNodeshiftConfig function
  @param {string} [options.projectLocation] - the location(directory) of your projects package.json. Defaults to `process.cwd`
  @param {string} [options.token] - auth token to pass into the openshift rest client for logging in with the API Server.  Overrides the username/password
  @param {string} [options.username] - username to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.password] - password to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.apiServer] - Deprecated - use server instead. apiServer to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.server] - server to pass into the openshift rest client for logging in with the API Server
  @param {string} [options.insecure] - flag to pass into the openshift rest client for logging in with a self signed cert.  Only used with apiServer login.  default to false
  @param {string} [options.forceLogin] - Force a login when using the apiServer login.  Only used with apiServer login.  default to false
  @param {boolean} [options.expose] - Set to true to create a default Route and expose the default service.  defaults to false
  @param {string} [options.exposeHost] - Alias/DNS that points to the service. Must be used with expose
  @param {object} [options.namespace] -
  @param {string} [options.namespace.displayName] - flag to specify the project namespace display name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {boolean} [options.namespace.create] - flag to create the namespace if it does not exist. Only applicable for the build and deploy command. Must be used with namespace.name
  @param {string} [options.namespace.name] - flag to specify the project namespace name to build/deploy into.  Overwrites any namespace settings in your OpenShift or Kubernetes configuration files
  @param {string} [options.resourceProfile] - Define a subdirectory below .nodeshift/ that indicates where Openshift resources are stored
  @param {string} [options.imageTag] - set the version to use for the ubi8/nodejs-14.  Versions are ubi8/nodejs-14 tags: https://access.redhat.com/containers/?tab=tags#/registry.access.redhat.com/ubi8/nodejs-14
  @param {string} [options.outputImageStream] - the name of the ImageStream to output to.  Defaults to project name from package.json
  @param {string} [options.outputImageTag] - The tag of the ImageStream to output to. Defaults to latest
  @param {boolean} [options.quiet] - suppress INFO and TRACE lines from output logs
  @param {object} [options.deploy] -
  @param {number} [options.deploy.port] - flag to update the default ports on the resource files. Defaults to 8080
  @param {Array} [options.deploy.env] - an array of objects to pass deployment config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {object} [options.build] -
  @param {string} [options.build.strategy] - flag to change the build strategy used.  Values can be Docker or Source.  Defaults to Source
  @param {string/boolean} [options.build.recreate] - flag to recreate a buildConfig or Imagestream. values are "buildConfig", "imageStream", true, false.  Defaults to false
  @param {boolean} [options.build.forcePull] - flag to make your BuildConfig always pull a new image from dockerhub or not. Defaults to false
  @param {Array} [options.build.env] - an array of objects to pass build config environment variables.  [{name: NAME_PROP, value: VALUE}]
  @param {array} [options.definedProperties] - Array of objects with the format { key: value }.  Used for template substitution
  @param {boolean} [options.useDeployment] - Flag to deploy the application using a Deployment instead of a DeploymentConfig. Defaults to false
  @param {boolean} [options.knative] - EXPERIMENTAL. flag to deploy an application as a Knative Serving Service.  Defaults to false
  @param {boolean} [options.kube] - Flag to deploy an application to a vanilla kubernetes cluster.  At the moment only Minikube is supported.  Defaults to false
  @returns {Promise<object>} - Returns a JSON Object
*/
export function getNodeshiftConfig(options?: {
    projectLocation?: string;
    token?: string;
    username?: string;
    password?: string;
    apiServer?: string;
    server?: string;
    insecure?: string;
    forceLogin?: string;
    expose?: boolean;
    exposeHost?: string;
    namespace?: {
        displayName?: string;
        create?: boolean;
        name?: string;
    };
    resourceProfile?: string;
    imageTag?: string;
    outputImageStream?: string;
    outputImageTag?: string;
    quiet?: boolean;
    deploy?: {
        port?: number;
        env?: any[];
    };
    build?: {
        strategy?: string;
    };
}): Promise<object>;
