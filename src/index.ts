export interface IClient {
    destroy: ILifecycleMethod,
}
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

export type IParentHook = Omit<IParent, 'destroy'>;
export type IIFrameHook = Omit<IFrame, 'destroy'>;

export type ParentOpts = {
  iframeId: string;
  iframeSrc: string;
  effects: ParentEffects,
}

export type IFrameOpts = {
  parentOrigin: string,
  effects: IFrameEffects,
}

export function Parent({ iframeId, iframeSrc, effects }: ParentOpts): IParent {

  _init();

  return {
    callIFrameEffect,
    destroy,
  }

  function _init() {
    _validateIFrameId();
    _validateUrl(iframeSrc);
    _validateEffects(effects);
    window.addEventListener('message', _onMessageEvent);

    function _validateIFrameId() {
      const iframe = document.getElementById(iframeId);
      if (iframe && (!(isIFrame(iframe)))) {
        throw new Error(`An element with an id of ${iframeId} was found, but was actually a ${iframe.nodeName}`)
      }

      function isIFrame(el: HTMLElement) {
        return el.nodeName === 'IFRAME'
      }
    }
  }

  function _onMessageEvent(messageEvent: MessageEvent) {
    if (_whitelisted(messageEvent, iframeSrc)) {
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
    window.removeEventListener('message', _onMessageEvent)
  }

  function callIFrameEffect(signal: Signal) {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(signal, iframeSrc);
    }
  }
}

export function IFrame({ parentOrigin, effects }: IFrameOpts): IFrame {

  _init();

  return {
    callParentEffect,
    destroy,
  }

  function _init() {
    _validateUrl(parentOrigin);
    _validateEffects(effects);
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

  function callParentEffect(signal: Signal) {
    if (top == null) throw new Error('IFrame model must be rendered within an embedded iframe');
    top.postMessage(signal, parentOrigin);
  }
}

function _whitelisted(messageEvent: MessageEvent, trustedOrigin: string) {
  return messageEvent.origin === trustedOrigin;
}

function _isSignal(e: MessageEvent): e is SignalEvent {
  if (e.data as Signal) {
    return true;
  }
  return false;
}

function _validateUrl(u: string) {
  if (!(_validUrl(u))) throw new Error(`${u} is not a valid url`);
}

function _validUrl(u: string) {
  let url;
  try {
    url = new URL(u);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function _validateEffects(effects: unknown) {
  if (typeof effects === 'object' && effects !== null) {
    const effectNames = Object.keys(effects);
    // TODO: Enforce better checking here to ensure that functions passed as effects match the Effect function signature.
    effectNames.forEach(name => {
      const effect = effects[name as keyof typeof effects]
      const isEffect = typeof effect === 'function';
      if (!isEffect) throw new Error(`${name} is not a function`);
    });
  } else {
    throw new Error('effects must be an object where each property is a function')
  }
}