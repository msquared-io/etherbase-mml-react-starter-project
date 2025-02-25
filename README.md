# MML Etherbase Demo

This project is an example of a server that serves a live
[MML (Metaverse Markup Language)](https://mml.io/) document that uses [React](https://react.dev/).

The MML document is served via a WebSocket and live updated when the code is edited. It can be easily deployed to 
environments that support Node.js and expose ports to the internet.

The react application is inside the [`./mml-document`](./mml-document) folder. 

Edit [`./mml-document/src/index.tsx`](./mml-document/src/index.tsx) whilst the server is running to see your changes reflected live on screen. 

You can find documentation for MML at: 
[`https://mml.io/docs`](https://mml.io/docs).

## Running locally
Making sure you have Node.js installed, run the following from the root of the repository:

```bash
npm i
npm run dev
```

Once the server is running, open `http://localhost:20205` in your browser.

## Etherbase integration with MML

This demo replicates the result of clicking the dice to the blockchain, showing how you can use the [Etherbase React Client](https://www.npmjs.com/package/@msquared/etherbase-client) hooks in your MML project.

### Setup

First create an Etherbase source contract using the [frontend](https://etherbase-demo-frontend-496683047294.europe-west2.run.app/sources).

In permissions, create a new private key with the 'Emit' role. Once created save the private key, and deposit some SOM into the wallet.

In schema, add the following solidity event to your source contract:

```solidity
event DiceRoll(uint256 result)
```

Take your private key and set the value in `EtherbaseProvider` [./mml-document/src/index.tsx](./mml-document/src/index.tsx), replacing the placeholder private key.

Also in `index.tsx` change the `sourceAddress` to the contract address of the source contract you created.

### Running locally

Following the previous steps on running locally, go to `http://localhost:20205`. You should see the dice in the world.

Open up the schema view in the frontend for your source contract, then click on the dice. If everything works, you should see events appearing in the frontend with the value the dice lands on.

### Deploying

Etherbase MML documents work when deployed too, such as using the [MSquared Dashboard](https://dash.msquared.io/).

When running via `npm run dev` the console should log a line saying

```
Saved HTML to ./mml-document/build/index.html
```
Go to this file path and copy the contents of the `index.html` page.

In the MSquared Dashboard, create a new MML object, go to the 'Source' tab, and paste the contents of the `index.html` page into the Source window.

Below, toggle the preview and enable the light. Click the dice and you should see the frontend event stream displaying the click events just like in the local example.

You can then take the URL from the 'General' tab and use the MML anywhere MML is supported!

### How it works

This project is based on the [MML React Starter Project](https://github.com/mml-io/mml-react-starter-project) and altered to work for Etherbase.

First we add the Etherbase config via an `EtherbaseProvider` in [./mml-document/src/index.tsx](./mml-document/src/index.tsx) which tells the [Etherbase React Client](https://www.npmjs.com/package/@msquared/etherbase-client) where to send and request information from and the authentication to use.

Then in [./mml-document/src/Dice.tsx](./mml-document/src/Dice.tsx) we need to make it so clicking the Dice sends an event to the blockchain. We can do this by first setting up our hook:

```tsx
const sourceAddress = "0x2e30b662c4Df268edA9efce596CDF3896b50B43C"
const { emitEvent } = useEtherbaseSource({ sourceAddress })
```

then in the dice rolling logic we simply add this afterwards:

```tsx
await emitEvent({
    name: "DiceRoll",
    args: {
    result: newResult,
    },
})
```

which will emit an event using the schema we added earlier to our source address. That's it!