import * as client_hooks from '../../../src/hooks.client.ts';

export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15')
];

export const server_loads = [0];

export const dictionary = {
		"/": [2],
		"/forgot-password": [~3],
		"/partner/dashboard": [4],
		"/partner/verification": [5],
		"/partner/verified-residents": [6],
		"/register": [~7],
		"/resident/dashboard": [8],
		"/resident/privacy-policy": [9],
		"/resident/verification": [10],
		"/trello/building": [~11],
		"/trello/resident": [~12],
		"/trello/resident/bypass": [~13],
		"/trello/support": [~14],
		"/update-password": [15]
	};

export const hooks = {
	handleError: client_hooks.handleError || (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';