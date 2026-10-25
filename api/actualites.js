import { forward } from '../server/pythonanywhere.js';

export default function handler(request, response) {
  return forward(request, response, { method: 'GET', endpoint: 'actualites' });
}
