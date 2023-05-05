// Types
export interface IClient {
    init: ILifecycleMethod,
    destroy: ILifecycleMethod,
  }
  
  type ILifecycles = "init" | "destroy";
  type ILifecycleMethod = () => void;
  
  export type ParentEffects = {
    [key: string]: ParentEffect,
  }
  
  export type IFrameEffects = {
    [key: string]: IFrameEffect,
  }
  
  type ParentEffect = (ctx: ParentEffectContext) => void;
  type IFrameEffect = (ctx: IFrameEffectContext) => void;
  
  type EffectArgs = {
    [key: string]: any;
  }
  
  type ParentEffectContext = {
    args: EffectArgs,
    callIFrameEffect: (signal: Signal) => void,
  }
  
  type IFrameEffectContext = {
    args: EffectArgs,
    callParentEffect: (signal: Signal) => void,
  }
  
  export interface SignalEvent extends MessageEvent {
    data: Signal,
  }
  
  export interface Signal {
    name: string,
    args: EffectArgs,
  }
  
  export interface ParentEffectArgs {
    [key: string]: any,
    callIFrameEffect: (signal: Signal) => void,
  }
  
  export interface IFrameEffectArgs {
    [key: string]: any,
    callParentEffect: (signal: Signal) => void,
  }
  
  export interface IParent extends IClient {
    callIFrameEffect: (signal: Signal) => void,
  }
  
  export interface IFrame extends IClient {
    callParentEffect: (signal: Signal) => void,
  }
  
  export type IParentHook = Omit<IParent, ILifecycles>;
  export type IIFrameHook = Omit<IFrame, ILifecycles>;
  
  export type ParentOpts = {
    iframeOpts: IParentIFrameOpts,
    effects: ParentEffects,
  }
  
  export type IFrameOpts = {
    parentOrigin: string,
    effects: IFrameEffects,
  }
  
  export type IParentIFrameOpts = {
    id: string,
    containerId: string,
    src: string,
    classes?: Array<string> | undefined,
  }
  
  // GLOBALS
  let parentInitialized = false;
  
  // CORE API
  export function Parent({ effects, iframeOpts: { id, containerId, src, classes } }: ParentOpts): IParent {
  
    return {
      init,
      callIFrameEffect,
      destroy,
    }
  
    /**
     * Initializes handlers to listen for message events from the embedded iframe.
     */
    function init() {
      if (!parentInitialized) {
        const container = document.getElementById(containerId);
        if (!container) throw new Error(`A container element with an id of ${containerId} could not be found`);
      
        const iframe = document.createElement('iframe');
        iframe.id = id;
        iframe.src = src;
        if (Array.isArray(classes)) {
          classes.forEach(cls => iframe.classList.add(cls));
        }
      
        container.appendChild(iframe);
      
        window.addEventListener('message', _onMessageEvent);
      }
      parentInitialized = true;
    }
  
    function _onMessageEvent(messageEvent: MessageEvent) {
      if (_whitelisted(messageEvent, src)) {
        if (_isSignal(messageEvent)) {
          const { name, args } = messageEvent.data;
          _callEffect(name, args);
        }
      }
    }
  
    function _callEffect(name: string, args: object) {
      if (effects[name]) {
        effects[name]({ args, callIFrameEffect });
      }
    }
  
    function destroy() {
      const iframe = document.getElementById(id);
      if (iframe) {
        iframe.remove();
      }
      window.removeEventListener('message', _onMessageEvent)
    }
  
    /**
     * Posts a message to the Child window - where the message is an object that contains:
     * 1. The name ('functionName') of the function defined on the Parent object that should be called.
     * 2. The arguments ('args') that should be provided to that function when called.
     * @param opts
     */
    function callIFrameEffect(signal: Signal) {
      const iframe = document.getElementById(id) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(signal, src);
      }
    }
  }
  
  export function Child({ parentOrigin, effects }: IFrameOpts): IFrame {
    return {
      init,
      callParentEffect,
      destroy,
    }
  
    /**
     * Initializes handlers to listen for message events from the parent window.
     */
    function init() {
      window.addEventListener('message', _onMessageEvent);
    }
  
    function destroy() {
      window.removeEventListener('message', _onMessageEvent);
    }
  
    function _onMessageEvent(messageEvent: MessageEvent) {
      if (_whitelisted(messageEvent, parentOrigin)) {
        if (_isSignal(messageEvent)) {
          const { name, args } = messageEvent.data;
          _callEffect(name, args);
        }
      }
    }
  
    function _callEffect(name: string, args: object) {
      if (effects[name]) {
        effects[name]({ args, callParentEffect });
      }
    }
  
    /**
     * Posts a message to the Parent window - where the message is an object that contains:
     * 1. The name ('functionName') of the function defined on the Parent object that should be called.
     * 2. The arguments ('args') that should be provided to that function when called.
     * @param methodOpts 
     */
    function callParentEffect(signal: Signal) {
      if (top == null) throw new Error('Child must be rendered within an embedded iframe');
      top.postMessage(signal, parentOrigin);
    }
  }
  
  // UTILS
  /**
   * Returns a boolean indicating whether a given MessageEvent.origin matches what is permitted.
   * @param messageEvent 
   * @param whitelistedOrigin 
   * @returns boolean
   */
  function _whitelisted(messageEvent: MessageEvent, whitelistedOrigin: string) {
    return messageEvent.origin === whitelistedOrigin;
  }
  /**
   * Returns a boolean indicating whether a given MessageEvent matches the expected API for this library.
   * @param e 
   * @returns boolean
   */
  function _isSignal(e: MessageEvent): e is SignalEvent {
    if (e.data as Signal) {
      return true;
    }
    return false;
  }
  