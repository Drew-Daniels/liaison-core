import { describe, expect, it } from 'vitest';
import { Parent } from "./index";

describe('Parent', () => {
    const VALID_IFRAME_CONTAINER_ID = 'valid-iframe-container-id';
    const VALID_IFRAME_ID = 'valid-iframe-id';
    const VALID_IFRAME_SRC = 'http://localhost:3000';
    const VALID_IFRAME_CLASSES = 'spam test';

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

    function _eraseDOM() {
        document.body.innerHTML = '';
    }

    const validIFrameOpts = {
        id: VALID_IFRAME_ID,
        containerId: VALID_IFRAME_CONTAINER_ID,
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

            // it('Throws when an element with an id of {id} is found, but it is not an IFRAME', () => {
            //     const i = document.createElement('div');
            //     i.id = 
            // })
        })
    });
});

// describe('IFrame', () => {
//     describe('Options', () => {

//     });
//     describe('Lifecycle methods', () => {

//     });
// });