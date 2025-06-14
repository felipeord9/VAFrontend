import { config } from '../config'
const url = `${config.apiUrl}/mail/send`;

function sendMail(body) {
  return fetch(url, {
    method: 'POST',
    /* headers: {
      'Content-Type': 'application/json',
    }, */
    body: body
  })
  .then(res => res.json())
  .then(res => res.data)
}

export {
  sendMail
}