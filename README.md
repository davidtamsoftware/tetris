# Tetris <!-- omit in toc --> &middot; [![Build Status](https://travis-ci.org/davidtamsoftware/tetris.svg?branch=master)](https://travis-ci.org/davidtamsoftware/tetris) [![Coverage Status](https://coveralls.io/repos/github/davidtamsoftware/tetris/badge.svg?branch=master)](https://coveralls.io/github/davidtamsoftware/tetris?branch=master) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## Overview <!-- omit in toc -->

Classic Tetris game implemented using latest web technologies. Supports single player and multiplayer (local and remote).

A running demo can be found [here](https://hidden-tundra-30225.herokuapp.com)

## Table of Contents <!-- omit in toc -->
- [Game Features](#Game-Features)
  - [Audio](#Audio)
  - [Scoring / Level System](#Scoring--Level-System)
  - [Single Player](#Single-Player)
  - [Local Multiplayer](#Local-Multiplayer)
    - [High Score Battle](#High-Score-Battle)
    - [Attack Mode](#Attack-Mode)
  - [Remote Multiplayer](#Remote-Multiplayer)
- [Controls](#Controls)
  - [Primary Player](#Primary-Player)
  - [Secondary Player](#Secondary-Player)
- [Technical Solution](#Technical-Solution)
  - [Tech Stack](#Tech-Stack)
  - [Modules](#Modules)
  - [Module Dependency](#Module-Dependency)
  - [Solution Architecture](#Solution-Architecture)
  - [Front End Design / React Component Interaction](#Front-End-Design--React-Component-Interaction)
  - [Back End Design / Game Server](#Back-End-Design--Game-Server)
  - [Summary of Design Patterns / Algorithms](#Summary-of-Design-Patterns--Algorithms)
  - [Performance for Multiplayer](#Performance-for-Multiplayer)
  - [Misc Features for Multiplayer](#Misc-Features-for-Multiplayer)
  - [Future Components](#Future-Components)
  - [Deployment](#Deployment)
- [Running the App](#Running-the-App)

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
| - | -|
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
  * Centralize core logic using Hexagonal architecture
  * Design allow for adding another app using a different UI framework all while reusing the same modules.
* Composition design pattern
  * Multiplayer composes Tetris game logic
  * Reuse existing game logic and add multiplayer synchronization between 2 Tetris instances
* Publish-subscribe interface
  * Allow for state changes to be pushed to clients following an event based model
* Functional programming for Tetris transformations (rotation, movement of pieces)
* Matrix maniplulation algorithms for rotations

## Performance for Multiplayer

* Game state is calculated on server and pushed to client
* Volume of message traffic was taken into design consideration
  * Push only 1 message every 50ms for game state
  * Push game events (damage, line removals, game over) to players as required as these cannot be mass generated by the user
  * Do not push game events that can be mass generated (rotations, pause in/out). Instead, generate these on the client side since these can be detected at on the client to reduce the number of messages. On local mode, components can locally subscribe to these events as there is no network overhead since it is local.

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

## Deployment

* Published to Heroku
* https://hidden-tundra-30225.herokuapp.com

# Running the App

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