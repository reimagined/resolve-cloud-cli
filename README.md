## [ReSolve](https://github.com/reimagined/resolve) Cloud Platform Command Line Interface

This package provdeploymentIdes an interface used to deploy [reSolve](https://github.com/reimagined/resolve) applications to the cloud.

## Usage

Use the following console inputs to add this CLI to your reSolve project, login to the reSolve Cloud Platform and deploy the application:

```sh
yarn create resolve-app resolve-app
cd resolve-app
<develop your app locally>
yarn add resolve-cloud
yarn resolve-cloud login
yarn resolve-cloud deploy
```

### Install the CLI

The reSolve Cloud Platform CLI is available on NPM. You can add it to a project as shown below:

```
yarn add resolve-cloud
```

### Log in to the reSolve Cloud Platform

Use the `login` command to authenticate and authorize to the reSolve cloud platform:

```
yarn resolve-cloud login
```

The CLI manages an authentication session so you stay logged in between queries.

## Manage Deployments

Use the `deploy` command to deploy an application to the cloud:

```
yarn resolve-cloud deploy
```

The cloud platform assigns an ID to an application deployment.

Pass a deployment's ID to the `remove` command to remove this deployment:

```
yarn resolve-cloud remove <deploymentId>
```

## View Deployment information

To view the list of all your deployments, type:

```
yarn resolve-cloud list
```

Use the `describe` command to view information on a specific deployment:

```
yarn resolve-cloud describe <deploymentId>
```

## Manage Read Models

The `read-models` command manages the application's read models.

##### View a deployed application's read models:

```
yarn resolve-cloud read-models list <deploymentId>
```

##### Pause and resume read model updates:

```
yarn resolve-cloud read-models pause <deploymentId> <readModelName>
```

```
yarn resolve-cloud read-models resume <deploymentId> <readModelName>
```

##### Reset a read model's persistent state:

```
yarn resolve-cloud read-models reset <deploymentId> <readModelName>
```

## Manage Sagas

The `sagas` command manages the application's sagas.

##### View a list of available sagas:

```
yarn resolve-cloud sagas list <deploymentId>
```

##### Pause and resume a saga:

```
yarn resolve-cloud sagas pause <deploymentId> <sagaName>
```

```
yarn resolve-cloud sagas resume <deploymentId> <sagaName>
```

##### Reset a saga's persistent state:

```
yarn resolve-cloud sagas reset <deploymentId> <sagaName>
```

### Manage Saga Properties

Use the `sagas properties` command to manage a saga's properties.

##### Add a property:

```
yarn resolve-cloud sagas properties add <deploymentId> <sagaName> <propertyName> <value>
```

##### View all saga's properties:

```
yarn resolve-cloud sagas properties list <deploymentId> <sagaName>
```

##### Remove a property:

```
yarn resolve-cloud sagas properties remove <deploymentId> <sagaName> <propertyName>
```

##### Update a property's value:

```
yarn resolve-cloud sagas properties update <deploymentId> <sagaName> <propertyName> <newValue>
```

## Manage Environment Variables

The following commands allow you to manage environment variables available for a deployment.

##### Set environment variables:

```
yarn resolve-cloud environment set <deploymentId> <keyValuePairs>
```

##### Remove an environment variable:

```
yarn resolve-cloud environment remove <deploymentId> <variableNameList>
```

## View Logs

Use the `logs` command to view and manage application logs.

##### View logs:

```
yarn resolve-cloud logs get <deploymentId>
```

##### Remove logs:

```
yarn resolve-cloud logs remove <deploymentId>
```

## Trace Application Performance

Use the `tracing` command to control application performance tracing.

##### Enable Performance Tracing:

```
resolve-cloud tracing enable <deploymentId>
```

##### Disable Performance Tracing:

```
resolve-cloud tracing disable <deploymentId>
```

##### Check Whether Performance Tracing is Enabled:

```
resolve-cloud tracing status <deploymentId>
```

##### View the List of an Application's Performance Traces:

```
resolve-cloud tracing summary <deploymentId>
```

##### View a Trace:

```
resolve-cloud tracing get <deploymentId> <traceId>
```

## View Help

To view help on this CLI, type:

```
yarn resolve-cloud --help
```

You can also view help for a specific command, for example:

```
yarn resolve-cloud deploy --help
```
