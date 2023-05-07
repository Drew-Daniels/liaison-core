import { describe, expect, it } from 'vitest';
import { Parent } from "./index";

describe('Parent', () => {
    const VALID_IFRAME_CONTAINER_ID = 'valid-iframe-container-id';
    const VALID_IFRAME_ID = 'valid-iframe-id';
    const VALID_IFRAME_SRC = 'http://localhost:3000';
    const VALID_IFRAME_CLASSES = 'spam test';

    const INVALID_IFRAME_SRC = 'invalid-iframe-src-url';

    function _setDOMWithValidContainerAndIFrame() {
        _eraseDOM();
        document.body.innerHTML = `
            <div id="${VALID_IFRAME_CONTAINER_ID}">
                <iframe id="${VALID_IFRAME_ID}" src="${VALID_IFRAME_SRC}" class="${VALID_IFRAME_CLASSES}"></iframe>
            </div>
        `;
    }

    function _setDOMWithInvalidContainer() {
        _eraseDOM();
        document.body.innerHTML = `<p id="${VALID_IFRAME_CONTAINER_ID}"></div>`;
    }

    function _setDOMWithInvalidIFrame() {
        _eraseDOM();
        document.body.innerHTML = `
            <div id="${VALID_IFRAME_CONTAINER_ID}">
                <p id="${VALID_IFRAME_ID}"></p>
            </div>
        `;
    }

    function _setDOMWithValidContainerOnly() {
        _eraseDOM();
        document.body.innerHTML = `<div id="${VALID_IFRAME_CONTAINER_ID}"></div>`;
    }

    function _eraseDOM() {
        document.body.innerHTML = '';
    }

    const validIFrameOpts = {
        containerId: VALID_IFRAME_CONTAINER_ID,
        id: VALID_IFRAME_ID,
        src: VALID_IFRAME_SRC,
        classes: VALID_IFRAME_CLASSES.split(' '),
    }

    const validEffects = {
        noOp: () => {},
    }
    describe('Options', () => {
        describe('iframeOpts: ', () => {
            describe('containerId', () => {
                it('Throws when an element with an id of {containerId} cannot be found', () => {
                    _setDOMWithValidContainerAndIFrame();
                    expect(() => { 
                        Parent({
                            iframeOpts: {
                                ...validIFrameOpts,
                                containerId: 'invalid'
                            },
                            effects: {
                                ...validEffects,
                            }
                        })
                    }).toThrow();
                })
                it('Throws when an element with an id of {containerId} was found, but it cannot be used as an iframe container', () => {
                    _setDOMWithInvalidContainer();
                    expect(() => { 
                        Parent({
                            iframeOpts: {
                                ...validIFrameOpts,
                            },
                            effects: {
                                ...validEffects,
                            }
                        })
                    }).toThrow();
                });
            });
            describe('id', () => {
                it('Throws when an iframe with an id of {id} is found, but is not an iframe', () => {
                    _setDOMWithInvalidIFrame();
                    expect(() => { 
                        Parent({
                            iframeOpts: {
                                ...validIFrameOpts,
                            },
                            effects: {
                                ...validEffects,
                            }
                        })
                    }).toThrow();
                });
            })
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
                                classes: [{}],
                            },
                            effects: {
                                ...validEffects,
                            }
                        })
                    }).toThrow();
                });
            })
        })
    });
});

// describe('IFrame', () => {
//     describe('Options', () => {

//     });
//     describe('Lifecycle methods', () => {

//     });
// });