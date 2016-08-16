# SpaceBro Client

## Introduction

SpaceBro Client will allow to automagically connect your applications to a [Spacebro server](https://github.com/soixantecircuits/spacebro).

### Installation

SpaceBro Client is available on NPM.
```bash
npm install --save spacebro-client
```

## Getting started

See tutorial.md for a beginner tutorial on *"How to do a simple ping pong with SpaceBro CLient"*.

## More API
When you require `spacebro-client`, you will receive an object with three functions: registerToMaster: `iKnowMyMaster`, `registerToMaster` and `emit`.

#### iKnowMyMaster (address, port)
You must call `iKnowMyMaster` to set the address and port of your server before registering to it. if you don't, it will use MDNS to find it.

#### registerToMaster (actionList, clientName [, zeroconfName])
This is the function that will start the connection between your application and the server. You must give it an `actionList` and a `clientName`.

The `actionList` is an array of objects with two properties:
- **name** (string) - the event's name
- **trigger** (function) - the function that will be called when you receive the event. it can reveice one argument that will be passed with the event.

The `clientName` is the name that will be used by spaceBro to identify your application. It's a string.

The `zeroconfName` is the name of the spaceBro service you want to connect to.

#### emit (event [, data])
The `emit` function is used to broadcast an event to all applications connected to the spaceBro server (including the very app that sending the event). It can have a second argument that will be passed to the trigger functions. For more that one argument, use an array or and object.
