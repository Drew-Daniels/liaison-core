import { describe, expect, it, afterEach, vi } from 'vitest';
import { Parent, IFrame, IFrameOpts } from "./index";

describe('Parent', () => {
    const VALID_IFRAME_ID = 'valid-iframe-id';
    const VALID_IFRAME_SRC = 'http://localhost:3000';

    const INVALID_IFRAME_SRC = 'invalid-iframe-src-url';

    function _setDOMWithValidContainerAndIFrame() {
        document.body.innerHTML = `
            <iframe id="${VALID_IFRAME_ID}" src="${VALID_IFRAME_SRC}"></iframe>
        `;
    }

    function _setDOMWithInvalidIFrame() {
        document.body.innerHTML = `
            <p id="${VALID_IFRAME_ID}"></p>
        `;
    }

    const validEffects = {
        noOp: () => {},
    }

    afterEach(() => {
        document.body.innerHTML = '';
    })

    describe('Constructor', () => {
        describe('iframeId', () => {
            it('Throws when an iframe with an id of {id} is found, but is not an iframe', () => {
                _setDOMWithInvalidIFrame();
                expect(() => { Parent({
                    iframe: {
                        id: VALID_IFRAME_ID,
                        src: VALID_IFRAME_SRC,
                    },
                    effects: {
                        ...validEffects,
                    }
                }) }).toThrow();
            });
        })
        describe('iframeSrc', () => {
            it('Throws when {iframeSrc} is not a valid URL', () => {
                expect(() => { 
                    Parent({
                        iframe: {
                            id: VALID_IFRAME_ID,
                            src: INVALID_IFRAME_SRC,
                        },
                        effects: {
                            ...validEffects,
                        }
                    })
                }).toThrow();
            });
        });
        describe('effects', () => {
            it('Thows when no effects are created', () => {
                _setDOMWithValidContainerAndIFrame();
                expect(() => { 
                    Parent({
                        iframe: {
                            id: VALID_IFRAME_ID,
                            src: VALID_IFRAME_SRC,
                        },
                        //@ts-ignore
                        effects: undefined,
                    })
                }).toThrow();
            });
            it('Throws when effects are not functions', () => {
                _setDOMWithValidContainerAndIFrame();
                expect(() => { 
                    Parent({
                        iframe: {
                            id: VALID_IFRAME_ID,
                            src: VALID_IFRAME_SRC,
                        },
                        //@ts-ignore
                        effects: {
                            //@ts-ignore
                            willError: 'spam',
                        },
                    })
                }).toThrow();
            })
        })
        it('Returns expected API when provided valid configurations: ', () => {
            const parent = Parent({
                iframe: {
                    id: VALID_IFRAME_ID,
                    src: VALID_IFRAME_SRC,
                },
                effects: {
                    ...validEffects,
                }
            })
            expect(typeof parent.callIFrameEffect === 'function').toBe(true);
        })
    })
    describe.todo('Lifecycle methods', () => {
        describe.todo('destroy()');
    });
    describe.todo('callIFrameEffect', () => {
        it.todo('is able to call a function on the iframe model with no arguments');
        it.todo('is able to call a function with arguments');
        it.todo('is able to call a')
    });
});

describe('IFrame', () => {
    const validOpts: IFrameOpts = {
        parentOrigin: 'http://localhost:3000',
        effects: {
            noOp: () => {},
        }
    }

    describe('Constructor', () => {
        describe('Returns an object with: ', () => {
            const i = IFrame(validOpts);
            it('callParentEffect', () => {
                expect(typeof i.callParentEffect === 'function').toBe(true);
            });
            it('destroy() method', () => {
                expect(typeof i.destroy === 'function').toBe(true);
            });
        });
    });
    describe('Options', () => {
        it('Throws when {parentOrigin} is not a valid URL', () => {
            expect(() => {
                IFrame({
                    ...validOpts, 
                    parentOrigin: 'invalid-url'  
                });
            }).toThrow();
        });
        it('Throws when {effects} is not a map of functions', () => {
            expect(() => {
                IFrame({
                    ...validOpts,
                    //@ts-ignore
                    effects: undefined,
                })
            }).toThrow();
        });
    });
    describe('Lifecycle methods', () => {
        // TODO: Add mock to check if window.addEventListener and window.removeEventListener called with the right args
        describe.todo('destroy()');
    });
    describe.todo('callParentEffect');
});