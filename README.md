## [ReSolve](https://github.com/reimagined/resolve) Cloud Platform Command Line Interface

This package provides an interface used to deploy applications implemented using the [reSolve](https://github.com/reimagined/resolve) framework to the cloud.

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

Use the `login` command to authenticate and authorize to the reSolve cloud platform.

```
yarn resolve-cloud login
```

The CLI manages a refresh token so you stay logged in between queries.

## Mange Deployments

Use the `deploy` command to deploy an application to the cloud.

```
yarn resolve-cloud deploy
```

The cloud platform assigns an ID to an application deployment.

Pass a deployment ID to the `remove` command to remove a deployment.

```
yarn resolve-cloud remove <ID>
```

## View Deployment information

To view the list of all your deployments, type:

```
yarn resolve-cloud list
```

Use the `describe` command to vie information on a specific deployment.

```
yarn resolve-cloud describe <ID>
```

## Manage Read Models

Use the `read-models` command to manage the application's read models.

Use the `read-models list` command to view a deployed application's read models.

```
yarn resolve-cloud read-models list <ID>
```

You can pause and resume read model update process as shown below.

##### pause:

```
yarn resolve-cloud read-models pause <ID> <read model name>
```

##### resume:

```
yarn resolve-cloud read-models resume <ID> <read model name>
```

The `reset` command allows you to reset a read model's persistent state.

```
yarn resolve-cloud read-models reset <ID> <read model name>
```

## Manage Sagas

Use the `sagas` command to manage the application's sagas.

You can view a list of available sagas ash shown below:

```
yarn resolve-cloud sagas list <ID>
```

The following commands allow you to pause and resume a saga.

##### pause:

```
yarn resolve-cloud sagas pause <ID> <saga name>
```

##### resume:

```
yarn resolve-cloud sagas resume <ID> <saga name>
```

The `reset` command allows you reset a saga's persistent state.

```
yarn resolve-cloud sagas reset <ID> <saga name>
```

### Manage Saga Properties

Use the `sagas properties` command to manage a saga's properties.

Add a property:

```
yarn resolve-cloud sagas properties add <ID> <saga name> <property name> <value>
```

View all saga's properties:

```
yarn resolve-cloud sagas properties list <ID> <saga name>
```

Remove a property:

```
yarn resolve-cloud sagas properties remove <ID> <saga name> <property name>
```

Update a property's value:

```
yarn resolve-cloud sagas properties update <ID> <saga name> <property name> <new value>
```

## Specify Environment Variables

## View Logs

The following commands allow you to manage environment variables available for a deployment:

Set an environment variable:

```
yarn resolve-cloud logs set <ID>
```

Remove an environment variable:

```
yarn resolve-cloud logs remove <ID>
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
