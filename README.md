# TermXT API
This project is the API of TermXT - an terminal direct messaging app

## API routes
- **/user/register** - POST create an user
    - body format: `{ username: string, password: string }`
    - response format (200): `{ message: string, data: { username: string, code: string }, error: false }`
    - response format (400/409): `{ message: string, error: true }`
- **/user/login** - POST login into an existing user
    - body format: `{ username: string, password: string }`
    - response format (200): `{ message: string, data: { username: string, code: string }, error: false}`
    - response format (403/404): `{ message: string, error: true}`
- **/user/exists?username** - GET checks if an username exists
    - query param: `{ username: string }`
    - response format (200): `1`
    - response format (404): `0`
- **/chat** - WS main chat websocket
    - message format: `{ message: string, to: string, format: string }`
- **/** - GET documentation of the API