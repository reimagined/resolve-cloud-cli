# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.27.0

### Breaking Changes

- The `deployment` option is now optional instead of positional for all commands.
For example, previously, the format was: `resolve-cloud read-models list <id>`, now it is: `resolve-cloud read-models list --deployment=<id>`.
The deployment ID can be omitted if the current working directory is a deployed application's root directory.

### Added

- The `event-stores import` and `event-stores export` commands were added.
- The `follow` and `offset` options were added for the `logs get` command.
- The `event-store-id` and `mode` options were added for the `event-stores create` command.
- The `with-event-store` option was added for the `remove` command.
- The `domains add-user`, `domains remove-user`, `domains set-users` and `domains get-verification-code` commands were added.
- The `env list` command was added.
- The `logs enable` and `logs disabled` commands were added.
- The `build` command was added.
- The `read-models pause-all`, `read-models resume-all` and `read-models reset-all` commands were added.
- The `sagas pause-all`, `sagas resume-all` and `sagas reset-all` commands were added.

### Changed

- The `events` option was renamed to `event-store` for the `deploy` command.
- The `domains add` command was renamed to `domains create` command.
- The `domains assign` and `domains release` commands were replaced with `set-domain` and `unset-domain` respectively.
- The `certificates issue` command was renamed to `certificates ensure`.
- The `eventstore-id` option was renamed to `event-store-id` for the `event-stores drop` command.

### Removed

- The `upgrade` command was removed.
- The `runtime` option was removed for the `deploy` command.
- The `wait` option was removed for the `deploy` and `remove` commands.
- The `runtime` and `events` options were removed for the `event-stores create` command.
- The `logs remove` command was removed.
- The `domains describe` command was removed.
