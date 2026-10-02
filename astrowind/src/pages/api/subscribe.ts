import type { APIRoute } from 'astro';
import { submit } from '~/lib/server-submission';

export const prerender = false;
export const POST: APIRoute = ({ request }) => submit('subscribe', request);
