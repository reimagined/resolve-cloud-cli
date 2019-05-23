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

## Mange Deployments

## Manage Read Models and Sagas

## Specify Environment Variables

## View Deployment information

## View Logs

## View Help

To view help on the CLI and its commands, type:

```
yarn resolve-cloud --help
```

You can also view help for a specific command, for example:

```
yarn resolve-cloud deploy --help
```
