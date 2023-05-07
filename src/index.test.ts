import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { IParent, Parent, IFrame, IFrameOpts, IParentIFrameOpts } from "./index";

describe('Parent', () => {
    const VALID_IFRAME_CONTAINER_ID = 'valid-iframe-container-id';
    const VALID_IFRAME_ID = 'valid-iframe-id';
    const VALID_IFRAME_SRC = 'http://localhost:3000';
    const VALID_IFRAME_CLASSES = 'spam test';

    const INVALID_IFRAME_SRC = 'invalid-iframe-src-url';

    function _setDOMWithValidContainerAndIFrame() {
        document.body.innerHTML = `
            <div id="${VALID_IFRAME_CONTAINER_ID}">
                <iframe id="${VALID_IFRAME_ID}" src="${VALID_IFRAME_SRC}" class="${VALID_IFRAME_CLASSES}"></iframe>
            </div>
        `;
    }

    function _setDOMWithInvalidContainer() {
        document.body.innerHTML = `<p id="${VALID_IFRAME_CONTAINER_ID}"></div>`;
    }

    function _setDOMWithInvalidIFrame() {
        document.body.innerHTML = `
            <div id="${VALID_IFRAME_CONTAINER_ID}">
                <p id="${VALID_IFRAME_ID}"></p>
            </div>
        `;
    }

    function _setDOMWithValidContainerOnly() {
        document.body.innerHTML = `<div id="${VALID_IFRAME_CONTAINER_ID}"></div>`;
    }

    const validIFrameOpts: IParentIFrameOpts = {
        containerId: VALID_IFRAME_CONTAINER_ID,
        id: VALID_IFRAME_ID,
        src: VALID_IFRAME_SRC,
        classes: VALID_IFRAME_CLASSES.split(' '),
    }

    const validEffects = {
        noOp: () => {},
    }

    afterEach(() => {
        document.body.innerHTML = '';
    })

    describe('Constructor', () => {
        it('Returns expected API when provided valid configurations: ', () => {
            const parent = Parent({
                iframeOpts: {
                    ...validIFrameOpts,
                },
                effects: {
                    ...validEffects,
                }
            })
            expect(typeof parent.init === 'function').toBe(true);
        })
    })
    describe('Options', () => {
        describe('iframeOpts: ', () => {
            describe('src', () => {
                it('Throws when {src} is not a valid URL', () => {
                    _setDOMWithValidContainerOnly();
                    expect(() => { 
                        Parent({
                            iframeOpts: {
                                ...validIFrameOpts,
                                src: INVALID_IFRAME_SRC,
                            },
                            effects: {
                                ...validEffects,
                            }
                        })
                    }).toThrow();
                });
            })
            describe('classes', () => {
                it('Throws when {classes} are not an array of strings', () => {
                    _setDOMWithValidContainerOnly();
                    expect(() => { 
                        Parent({
                            iframeOpts: {
                                ...validIFrameOpts,
                                //@ts-ignore
                                classes: [{}],
                            },
                            effects: {
                                ...validEffects,
                            }
                        })
                    }).toThrow();
                });
            })
            describe('Effects', () => {
                it('Thows when no effects are created', () => {
                    _setDOMWithValidContainerAndIFrame();
                    expect(() => { 
                        Parent({
                            iframeOpts: {
                                ...validIFrameOpts,
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
                            iframeOpts: {
                                ...validIFrameOpts,
                            },
                            //@ts-ignore
                            effects: {
                                //@ts-ignore
                                willError: 'spam',
                            },
                        })
                    }).toThrow();
                })
            });
        })
    });
    describe('Lifecycle methods', () => {
        describe('init()', () => {
            describe('containerId', () => {
                it('Throws when an element with an id of {containerId} cannot be found', () => {
                    _setDOMWithValidContainerAndIFrame();
                    const p = Parent({
                        iframeOpts: {
                            ...validIFrameOpts,
                            containerId: 'invalid'
                        },
                        effects: {
                            ...validEffects,
                        }
                    });
                    expect(() => { p.init() }).toThrow();
                })
                it('Throws when an element with an id of {containerId} was found, but it cannot be used as an iframe container', () => {
                    _setDOMWithInvalidContainer();
                    const p = Parent({
                        iframeOpts: {
                            ...validIFrameOpts,
                        },
                        effects: {
                            ...validEffects,
                        }
                    })
                    expect(() => { p.init() }).toThrow();
                });
            });
            describe('id', () => {
                it('Throws when an iframe with an id of {id} is found, but is not an iframe', () => {
                    _setDOMWithInvalidIFrame();
                    const p = Parent({
                        iframeOpts: {
                            ...validIFrameOpts,
                        },
                        effects: {
                            ...validEffects,
                        }
                    })
                    expect(() => { p.init() }).toThrow();
                });
            })
            it.todo('Adds event listeners to a pre-existing iframe (if an iframe with id of {id} can be found)', () => {
                _setDOMWithValidContainerAndIFrame();
                const p = Parent({
                    iframeOpts: {
                        ...validIFrameOpts,
                    },
                    effects: {
                        ...validEffects,
                    }
                })
                p.init();
            });
            it.todo('Creates a new iframe and adds event listeners (if an iframe with id of {id} cannot be found)', () => {
                _setDOMWithValidContainerOnly();
                const p = Parent({
                    iframeOpts: {
                        ...validIFrameOpts,
                    },
                    effects: {
                        ...validEffects,
                    }
                })
                p.init();
            })
        });
        describe('destroy()', () => {
            it('Removes the iframe element from the DOM', () => {
                _setDOMWithValidContainerOnly();
                const p = Parent({
                    iframeOpts: {
                        ...validIFrameOpts,
                    },
                    effects: {
                        ...validEffects,
                    }
                })
                p.init();
                expect(document.getElementById(VALID_IFRAME_ID)).toBeTruthy();
                p.destroy();
                expect(document.getElementById(VALID_IFRAME_ID)).toBeFalsy();
            });
        });
    });
    describe.todo('callIFrameEffect', () => {
        _setDOMWithValidContainerOnly();
        const mockParentFn = vi.fn();
        const mockIFrameFn = vi.fn();
        const parent = Parent({
            iframeOpts: {
                ...validIFrameOpts,
            },
            effects: {
                sayHiToIFrame: mockParentFn,
            }
        });
        parent.init();
        const iframe = IFrame({
            parentOrigin: VALID_IFRAME_SRC,
            effects: {
                sayHiToParent: mockIFrameFn,
            }
        });
        iframe.init();
        it('is able to call a function on the iframe model with no arguments', () => {
            parent.callIFrameEffect({ name: 'sayHiToParent', args: {} });
            expect(mockIFrameFn).toHaveBeenCalled();
        });
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
            it('init() method', () => {
                expect(typeof i.init === 'function').toBe(true);
            });
            it('callParentEffect', () => {
                expect(typeof i.callParentEffect === 'function').toBe(true);
            });
            it('destroy() method', () => {
                expect(typeof i.destroy === 'function').toBe(true);
            });
        });
    });
    describe('Options', () => {
        it('Throws when parentOrigin is not a valid URL', () => {
            expect(() => {
                IFrame({
                    ...validOpts, 
                    parentOrigin: 'invalid-url'  
                });
            }).toThrow();
        });
        it('Throws when effects are not functions', () => {
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
        describe.todo('init()');
        describe.todo('destroy()');
    });
    describe.todo('callParentEffect');
});