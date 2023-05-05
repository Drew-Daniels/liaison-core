# Liaison
_Liaison_ is a simple library with 0 dependencies that enables easy, secure communication between a browser window and embedded iframes, using the browser [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

> The window.postMessage() method safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it.

### Parent Model
The `Parent` model

#### Basic Usage with Trivial Effects
```js
const parent = Parent({
    iframeOpts: {
        id: 'my-iframe-id',
        containerId: 'my-embedded-iframe-container-element-id',
        src: 'https://embedded.com',
        classes: ['embedded']
    },
    effects: {
        sayHi: () => 'Hello!',
        sayBye: () => 'Bye!',
    }
});

// Parent must be manually initialized - this allows users to control when the iframe gets rendered onto the page.
parent.init();
```
##### Notes:
- If an `<iframe>` with an "id" attribute of "my-iframe-id" has already been rendered on the Parent window, this iframe will be used.
- If there is _no_ `<iframe>` with an "id" attribute of "my-iframe-id" rendered on the Parent window, this iframe will be created.

### IFrame Model

#### Basic Usage
```js
const iframe = IFrame({
    // whitelisted domain that the IFrame model will handle MessageEvents from.
    parentOrigin: 'https://parent.com',
    effects: {
        getSum()
    }
})
```

## Lower-Level API:

### Signals:
A `Signal` is an object of the following type:
```ts
export interface Signal {
    name: string,
    args: EffectArgs,
}

type EffectArgs = {
    [key: string]: any;
}
```
The `name` property indicates the _name of the `Effect`_ one client (`Parent` or `IFrame`) wants to _initiate on the other_.

### Effects:
An `Effect` is an object of the following type:
```ts
type ParentEffect = (ctx: ParentEffectContext) => void;
type IFrameEffect = (ctx: IFrameEffectContext) => void;

type ParentEffectContext = {
    args: EffectArgs,
    callIFrameEffect: (signal: Signal) => void,
}

type IFrameEffectContext = {
    args: EffectArgs,
    callParentEffect: (signal: Signal) => void,
}
```