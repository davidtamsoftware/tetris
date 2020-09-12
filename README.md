# Tetris <!-- omit in toc --> &middot; [![Build Status](https://travis-ci.org/davidtamsoftware/tetris.svg?branch=master)](https://travis-ci.org/davidtamsoftware/tetris) [![Coverage Status](https://coveralls.io/repos/github/davidtamsoftware/tetris/badge.svg?branch=master)](https://coveralls.io/github/davidtamsoftware/tetris?branch=master) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


## Overview <!-- omit in toc -->

Classic Tetris game implemented using latest web technologies. Supports single player and multiplayer (local and remote). Full end to end development with CI/CD pipeline, auto version / release note generation.

A running demo can be found [here](https://tetris-production.herokuapp.com)

## Table of Contents <!-- omit in toc -->
- [Game Features](#game-features)
  - [Audio](#audio)
  - [Scoring / Level System](#scoring--level-system)
  - [Single Player](#single-player)
  - [Local Multiplayer](#local-multiplayer)
    - [High Score Battle](#high-score-battle)
    - [Attack Mode](#attack-mode)
  - [Remote Multiplayer](#remote-multiplayer)
- [Controls](#controls)
  - [Primary Player](#primary-player)
  - [Secondary Player](#secondary-player)
- [Configurations](#configurations)
  - [Client Configurations](#client-configurations)
  - [Server Configurations](#server-configurations)
- [Technical Solution](#technical-solution)
  - [Tech Stack](#tech-stack)
  - [Modules](#modules)
  - [Module Dependency](#module-dependency)
  - [Solution Architecture](#solution-architecture)
  - [Front End Design / React Component Interaction](#front-end-design--react-component-interaction)
  - [Back End Design / Game Server](#back-end-design--game-server)
  - [Summary of Design Patterns / Algorithms](#summary-of-design-patterns--algorithms)
  - [Sequence Diagram](#sequence-diagram)
    - [Single Player](#single-player-1)
    - [Local Multiplayer](#local-multiplayer-1)
    - [Remote Multiplayer](#remote-multiplayer-1)
  - [Performance for Multiplayer](#performance-for-multiplayer)
  - [Misc Features for Multiplayer](#misc-features-for-multiplayer)
  - [Future Components](#future-components)
- [Running the App Locally](#running-the-app-locally)
- [CI/CD](#cicd)
  - [Features](#features)
  - [Pipeline](#pipeline)
  - [Technologies Used](#technologies-used)
  - [Environments](#environments)
    - [Dev](#dev)
    - [Staging](#staging)
    - [Prod](#prod)
  - [Test Coverage](#test-coverage)
  - [Rollbacks](#rollbacks)

# Game Features

## Audio

* All game modes have sound effects and background music
* Sources
  * https://opengameart.org/content/512-sound-effects-8-bit-style
  * https://commons.wikimedia.org/wiki/File:Tetris_theme.ogg

## Scoring / Level System

* Every 10 lines, the level will increase which will:
  * Increase drop speed
  * Increase the amount of points for completing lines

## Single Player

* Single player mode to play for highscore
* Tracks number of pieces, level, high score

## Local Multiplayer

### High Score Battle

* 2 players compete for the highest score. Winner is determined after both players games finish.

### Attack Mode

* 2 players compete to see who will be the last remaining player
* Ability to attack opposing player by sending random lines to opposition's playfield by getting triple or quadruple lines

## Remote Multiplayer

* Play remotely against anyone
* Players enter same match id to join the same game
* Supports both high score battle and attack mode

# Controls

<table style="width: 100%; align: center">
<tr>
<td align="center">

## Primary Player

</td>
<td align="center">

## Secondary Player

</td>
</tr>
<tr>
<td align="center">

| Key | Action |
| --- | --- |
| &larr; | Move Left |
| &rarr; | Move Right |
| &darr; | Move Down |
| Spacebar | Drop |
| R. Shift | Rotate Left |
| &uarr; | Rotate Right |

</td>
<td align="center">

| Key | Action |
| --- | --- |
| S | Move Left |
| F | Move Right |
| D | Move Down |
| A | Drop |
| E | Rotate Left |
| R | Rotate Right |

</td>
</tr>
<table>

# Configurations

## Client Configurations

Client configurations can be adjusted in:
- .env.development
- .env.production

| Environment Variable | Description | Datatype | Example |
| --- | --- | --- | --- |
| REACT_APP_TETRIS_SERVER_URL | Game server URL | string | ws://192.168.1.75:8080 |
| REACT_APP_TETRIS_WS_CLIENT_BATCH | Defines the smallest interval in milliseconds for sending player commands to server | number | 50 |
| REACT_APP_TETRIS_WS_CLIENT_BUFFER_LENGTH | Defines the maximum number of commands in each tranmission to server | number | 1 |

## Server Configurations

Server configurations can be adjusted by setting below environment variables:

| Environment Variable | Description | Datatype | Example |
| --- | --- | --- | --- |
| TETRIS_SERVER_REFRESH_INTERVAL | Defines the smallest interval in milliseconds for sending game state updates to players | number | 50 |

# Technical Solution

* Implemented using React and TypeScript
* Minimal libraries used to reduce external dependencies
* Follow object oriented programming and functional programming principles

## Tech Stack

* TypeScript
* React
* Jest
* Lerna
* Web Sockets

## Modules

| Modules| Description|
| - | - |
| tetris | Tetris webapp / presentation tier of the game implemented using React |
| tetris-ws-client | Web socket client library to communicate with game server |
| tetris-ws-model | Library that defines the data model used to represent the game instructions sent between client and server |
| tetris-core | Core library that holds all the domain logic for the Tetris game |
| tetris-server | Game server that manages the instances of the games and sends state to the game clients |

## Module Dependency

![picture](readme-assets/package-dependency.svg)

## Solution Architecture

The following solution overview diagram shows a subset of the components that make up the client / server Tetris game.

![picture](readme-assets/solution-overview.svg)

## Front End Design / React Component Interaction

The following details how the components interacts with React custom hooks to setup the Tetris game.

![picture](readme-assets/component-interaction.svg)

## Back End Design / Game Server

![picture](readme-assets/tetris-server-design.svg)

## Summary of Design Patterns / Algorithms

* Evolutionary architecture
  * Separation of core modules from UI implementation
  * Centralize core logic using Domain Driven Design / Hexagonal architecture
  * Design allows for adding another app using a different UI framework all while reusing the same modules.
* Composition design pattern
  * Multiplayer composes Tetris game logic
  * Reuse existing game logic and add multiplayer synchronization between 2 Tetris instances
* Observer Pattern
  * Allow for state changes to be pushed to clients following an event based model
* Functional programming (pure functions) for Tetris transformations (rotation, movement of pieces)
* Matrix maniplulation algorithms for rotations
* Inversion of Control / Dependency Injection
  * useGameControls React hook does key binding to GameActions interface
  * The assembler (useTetris, useMultiplayer, useMultiplayerRemote) will create the GameAction implementation (single player, local multiplayer, or remote multiplayer) and pass into this React hook
  * usePlayerControls follows this same pattern for key binding to PlayerActions interface.
* Rich Domain Model
  * Domain models for Tetris and Multiplayer encapsulate both data and behaviour.

##  Sequence Diagram

The following sequence diagram illustrates the flow of messages for the different game modes.

### Single Player

![picture](readme-assets/single-player-sequence-observer.svg)

### Local Multiplayer

![picture](readme-assets/multiplayer-local-sequence-observer.svg)

### Remote Multiplayer

![picture](readme-assets/multiplayer-remote-sequence-observer.svg)

## Performance for Multiplayer

* Game state is calculated on server and pushed to client
* Throttle the number of messages sent from server to client.
  * Game states are used to manage the current state of the tetris playfield and score
    * Broadcast only 1 game state update message every 50ms (configurable) to prevent backpressure for rendering UI
  * Game events are used to control audio
    * Broadcast game events (damage, line removals, game start, game over) to players as required as these cannot be mass generated by the user
    * Do not broadcast game events that can be mass generated by player (rotations, pause in/out). Instead, generate these on the client side since these can be detected at on the client to reduce the number of messages. On local mode, components can locally subscribe to these events as there is no network overhead since it is local.
* Throttle the number of messages sent from client to server
  * Send batch only if there is a message that is available over the last time interval
  * Set a time duration (configurable) that would be sufficient for batching a collection of commands but small enough to not have perceived lag
  * Prevent backpressure for server to process client commands by setting maximum number of commands (configurable) that can be set over within the time duration (ie. if the player holds down the rotate button, there could be send dozens of times within 1 second. This can be throttled to have < 10 actions. The feedback would feel responsive but reduce the amount of processing required for the server.)
* To reduce the size of the payload being sent, server broadcasts delta state since last broadcast

## Misc Features for Multiplayer

* Gracefully handle scenarios where players disconnects
  * Player drops or quits in the middle of the game
  * Server connectivity is lost
* Prevent players from joining a match that is already full
* Alert messages for when user joins/leaves the game

## Future Components

Since state is managed on the game server, each game server must maintain its own active games. The game server is implemented using web sockets so there is session affinity as the connection remains open for the duration of the time. As we horizontally scale the game servers, new clients will need to know how many game servers are available and what matches exist on each game server. To achieve this, a new Tetris server registry would need to be created. Using [Netflix Eureka](https://github.com/Netflix/eureka/wiki/Eureka-at-a-glance#high-level-architecture), game servers can be registered to the registry upon startup and polling interval. Updates (firewall changes) will need to be made to lock down the Eureka API to only allow readonly api calls to be made from the web client. The web client will communicate with Eureka APIs to determine which game servers are running.

This solution will allow users to browse through the list of registered game servers, and connect to the game server's APIs to view the list of active matches or join/create a match. This would allow for game servers to be scaled horizontally and allow users to find the game. 

The following diagram illustrates the changes that would made (Green indicates new):

![picture](readme-assets/future-server-registry.svg)

# Running the App Locally

At the root of the project, install and build the project:
```
npm install
```
To start the tetris webapp:
```
lerna exec --scope tetris -- npm run watch
```
To start the tetris server:
```
lerna exec --scope tetris-server -- npm start
```
# CI/CD

## Features

* Automatically trigger unit tests locally before pushing to origin
* Enforce usage of conventional commit format for commit messages
* Automatic detection of semantic version bump through commit message
* Automatic release note generation
* Pipeline is automatically triggered when new code is pushed to master

## Pipeline

![picture](readme-assets/tetris-cicd.svg)

## Technologies Used

| Tools | Technology |
| - | - |
| Version control | Git |
| Version control provider / repository | Bitbucket (also mirrored to GitHub for public access but not for CI/CD) |
| Git Hooks | Husky; Pre-push hook for ensuring passing tests before pushing to remote feature branch |
| Branching Strategy | Trunk based development with [short lived feature branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/); no release branch
| Versioning / Release Notes | Lerna and [Conventional Commits]() to automatically determine semantic version bump. Merge to master generates pre-release. Once pre-release is validated in staging, pre-released is graduated and pre-release docker image tagged as release and deployed to production. |
| Continuous Integration Build Server | Bitbucket CI Pipelines |
| Containerization | Docker |
| Hosting | Heroku Dyno using [docker deploy](https://devcenter.heroku.com/articles/container-registry-and-runtime#pushing-an-existing-image) |
| Docker Registry | Dockerhub |

## Environments

### Dev
* https://tetris-dev.herokuapp.com
* [Deployment with Git](https://devcenter.heroku.com/articles/git) Procfile defined in source code.

### Staging
* https://tetris-staging.herokuapp.com

### Prod
* https://tetris-production.herokuapp.com

## Test Coverage

Test coverage results reported to coveralls on each build:
https://coveralls.io/github/davidtamsoftware/tetris

## Rollbacks

In the event of a rollback, revert commit on master with message ["[skip ci]"] to prevent triggering Bitbucket pipeline when pushed to master. Redeploy past release on staging/production using [Bitbucket Deployment Dashboard](https://support.atlassian.com/bitbucket-cloud/docs/view-your-deployments-dashboard/) to refer to an older build/tag and redeploy that image back to the environment.