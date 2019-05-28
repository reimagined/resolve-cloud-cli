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

```
yarn resolve-cloud deploy
```

```
yarn resolve-cloud remove <ID>
```

## View Deployment information

```
yarn resolve-cloud list
```

```
yarn resolve-cloud describe <ID>
```

## Manage Read Models

Use the `read-models` command to manage the application's read models.

```
yarn resolve-cloud read-models list <ID>
```

```
yarn resolve-cloud read-models pause <ID> <read model name>
```

```
yarn resolve-cloud read-models resume <ID> <read model name>
```

```
yarn resolve-cloud read-models reset <ID> <read model name>
```

## Manage Sagas

Use the `sagas` command to manage the application's sagas.

```
yarn resolve-cloud sagas list <ID>
```

```
yarn resolve-cloud sagas pause <ID> <saga name>
```

```
yarn resolve-cloud sagas resume <ID> <saga name>
```

```
yarn resolve-cloud sagas reset <ID> <saga name>
```

### Manage Saga Properties

Use the `sagas properties` command to manage a saga's properties.

```
yarn resolve-cloud sagas properties add <ID> <saga name> <property name> <value>
```

```
yarn resolve-cloud sagas properties list <ID> <saga name>
```

```
yarn resolve-cloud sagas properties remove <ID> <saga name> <property name>
```

```
yarn resolve-cloud sagas properties update <ID> <saga name> <property name> <new value>
```

## Specify Environment Variables

## View Logs

```
yarn resolve-cloud logs get <ID>
```

## View Help

To view help on the CLI and its commands, type:

```
yarn resolve-cloud --help
```

You can also view help for a specific command, for example:

```
yarn resolve-cloud deploy --help
```
