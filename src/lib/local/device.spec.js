import { describe, expect, it } from 'vitest';
import { deviceName } from './device.svelte.js';

describe('deviceName', () => {
	it('makes a name an address part, else the default', () => {
		expect(deviceName('My Laptop')).toBe('my-laptop');
		expect(deviceName('  ')).toBe('device');
		expect(deviceName('Café')).toBe('cafe');
	});
});
