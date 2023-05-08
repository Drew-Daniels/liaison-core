# Liaison
_Liaison_ is a simple library with 0 dependencies that enables easy, secure communication between a browser window and embedded iframes, using the browser [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

> The window.postMessage() method safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it.

### Parent Model
The `Parent` model is used to:
- Define side effects (`effects`) that the `IFrame` model can expect to have the parent window run - _whenever_ it requests the parent window to run them. 

For most use cases, these side effects are going to be used for 2 general purposes:
- _Requesting_ the parent window send data to an iframe
    - Ex.) Authorization tokens
- _Notifiying_ the parent window that some event has occurred within an iframe.
    - Ex.) Informing the parent window that an iframe has finished logging a user out of the iframe.

#### Initialization
The parent window should not blindly handle any requests sent to it. Instead, it needs to make sure that the origin of each message is whitelisted.

This is handled by specifying the iframe we expect to receive messages from, and the url we should validate that those messages originate from.
```js
const parent = Parent({
    iframeId: 'my-iframe-id',
    iframeSrc: 'http://embedded.com',
    ...
});
```
Both `iframeId` and `iframeSrc` _are required_ and errors will be thrown if an iframe with an id of `{id}` and a `src` attribute of `{iframeSrc}` cannot be found on the page when the `Parent.init()` lifecycle method is called.

#### Lifecycle Methods
The `Parent` model has 2 lifecycle methods:
1. `init()` - Called after providing initial configurations to `Parent({...})`.
    - Initializes all of the provided event listeners (`effects`) on the parent window - enabling it to handle signals from the specified iframe. 
2. `destroy()` - Can be called to remove all event listeners on the parent window that are listening for signals from the specified iframe.

#### Message Handling (`Signals`)
When the parent window receives a [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent), it checks if:
- If the MessageEvent has an `origin` exactly matching `src`. 
    - If the message has _any other origin_ than `src`, it is completely ignored.
- If the `origin` matches `src`, the Parent model checks to ensure that the `MessageEvent` matches the expected API (i.e., contains a `Signal`)
- If the `MessageEvent` contains a `Signal`, this `Signal` can be matched to a corresponding `Effect` on the IFrame model.

#### Effects
_`Effects`_ (a.k.a., "side effects") are functions defined on the IFrame model, that the Parent model can expect to call on the IFrame model.
```js
const parent = Parent({
    ...
    effects: {
        // each `effect` can be synchronous
      sendToken: () => {
        const token = nanoid();
        // ...
      },
        // ... or asynchronous
        sendTokenAsync: async () => {
            await timeout(3000);
            const token = nanoid();
            // ... 
        }
    }
});

// ...
function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```
Each `effect` has access to an `args` object, which contains all the arguments passed from the `IFrame` model when it requests a certain side effect occur in the parent window:
```js
// ... in parent window
const parent = Parent({
    ...
    effects: {
      logMessageFromIFrame: ({ args }) => {
        console.log(`Message received from iframe: ${args.message}`)
      },
    }
});

// ... in iframe window
const iframe = IFrame({ ... });
iframe.callParentEffect({ 
    name: 'logMessageFromIFrame',
    args: { message: 'Greetings' },
});

// logs "Message received from iframe: Greetings"
```
Each `effect` defined in the call to `Parent` has access to the `callIFrameEffect` function, allowing it to _call back to the iframe_:

```js
// ... in parent window
const parent = Parent({
    ...
    effects: {
      sendToken: ({ callIFrameEffect }) => {
        const token = nanoid();
        callIFrameEffect({
            name: 'saveToken',
            args: { token }
        });
      },
    }
});

// ... in iframe window
const iframe = IFrame({
    ...
    effects: {
        saveToken: ({ token }) => {
            localStorage.setItem('authToken', token);
        }
    }
});
```

You can also use both `args` and `callIFrameEffect` together:
```js
// ... in parent window
const parent = Parent({
    ...
    effects: {
      sendToken: ({ args, callIFrameEffect }) => {
        if (args.system === 'client1') {
            token = 'xyz';
        } else {
            token = 'zyx';
        }
        callIFrameEffect({
            name: 'saveToken',
            args: { token }
        });
      },
    }
});
```
#### All Together:
```js
const parent = Parent({
    iframeOpts: {
        containerId: 'my-iframe-container-id',
        id: 'my-iframe-id',
        src: 'http://embedded.com',
        classes: ['cls1', 'cls2']
    },
    effects: {
      sendToken: ({ args, callIFrameEffect }) => {
        if (args.system === 'client1') {
            token = 'xyz';
        } else {
            token = 'zyx';
        }
        callIFrameEffect({
            name: 'saveToken',
            args: { token }
        });
      },
    }
});
```

### IFrame Model
The `IFrame` model is used to:
- Define side effects (`effects`) that the `Parent` model can expect to have the iframe window run - _whenever_ it requests the iframe window to run them. 

Similarly to the `Parent` model, these effects can be used to enable the parent window to:
- _Request_ data from the iframe
- _Notify_ the iframe that some event has occurred in the parent window.

#### Configuration
The iframe model will only initiate side effects in response to messages that have been verified to come from a recognized domain (`parentOrigin`):
```js
const iframe = IFrame({
    parentOrigin: 'https://parent.com',
    ...
});
```

#### Effects
Each `effect` defined on the `IFrame` model can be synchronous or asynchronous:
```js
const iframe = IFrame({
    ...
    effects: {
        load: () => {
            // fetch some data
        },
        lazyLoad: async () => {
            timeout(3000);
            // fetch some data
        }
    }
});

// ...
function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```
Each `effect` defined on the `IFrame` model has access to the `args` object containing all the arguments passed from the parent window to be used with this `effect`:
```js
const iframe = IFrame({
    parentOrigin: 'https://parent.com'
    effects: {
        saveData: ({ args }) => {
            // save this data to a db
        },
    }
});
```

Each `effect` defined on the `IFrame` model has access to the `callParentEffect` function so it can _call back to the parent window_:
```js
const iframe = IFrame({
    parentOrigin: 'https://parent.com'
    effects: {
        notifyParent: ({ callParentEffect }) => {
            callParentEffect({ name: 'notify', args: { notification: 'Something happened' } })
        },
    }
});

// ... in window with url of 'https://parent.com'
const parent = Parent({
    ...
    effects: {
        notify: ({ args }) => {
            console.log(`Notification: ${args.notification}`)
        },
    }
});

// logs "Notification: Something happened"
```

## API Glossary:
### Parent window
The browser window that contains an embedded window

### IFrame window
The embedded iframe window within the parent window

### Signals:
A `Signal` is an object that contains all the data needed for one client to understand what function it needs to run and the arguments it needs to call that function with.

- The `name` property indicates the _name of the `Effect`_ one client (`Parent` or `IFrame`) wants to _initiate on the other_.

- The `args` property is an object containing all of the arguments that the client was the other to include in its call to that effect.

### Effects
An `Effect` is a function that can be run on one of the clients, whenever the other client requests it be run.