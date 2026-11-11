import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page } from './html.js';

const template = '<html><head><title>x</title></head><body></body></html>';
const meta = { title: 'T', description: 'D', url: 'https://joblist.today/', body: '' };
