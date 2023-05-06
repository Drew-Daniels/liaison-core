import { describe, expect, it } from 'vitest';
import { Parent } from "./index";

describe('Parent', () => {
    it('Has init method', () => {
        expect(Object.hasOwn(Parent, 'init'))
    });
});