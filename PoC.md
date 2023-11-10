# How to implement an Authentication Center in AdonisJS

## Authentication Center Implementation

To create an authentication center akin to "Log in with Google," you'll need to implement **OAuth 2.0** and **OpenID Connect (OIDC)**.

**OAuth 2.0** is the industry-standard protocol for authorization. It focuses on client developer simplicity while providing specific authorization flows for web applications, desktop applications, mobile phones, and living room devices.

**OpenID Connect** is a simple identity layer on top of the OAuth 2.0 protocol, which allows clients to verify the identity of the end-user based on the authentication performed by an authorization server, as well as to obtain basic profile information about the end-user in an interoperable and REST-like manner.

### Components Needed:

1. **Authorization Server (Auth Center):**

   - Implements OAuth 2.0 and OpenID Connect protocols.
   - Manages client registrations, where your three apps are the clients.
   - Handles the user's login and consent, issuing an ID token (for OpenID Connect) and an access token.

2. **User Accounts and Directory:**

   - A user management system to store and manage user accounts and roles.

3. **Secure Data Storage:**

   - To store tokens, user information, and other sensitive data securely.

4. **Client Applications (Your Apps):**

   - Must be configured to redirect users to the Auth Center for authentication.
   - Handle the redirect back from the Auth Center with the authorization code.
   - Exchange the authorization code for an ID token and an access token at the Auth Center.

5. **APIs/Resources:**
   - Your server-side resources that the client apps will access using the access tokens.

### How It Works:

#### OAuth 2.0 Flow:

1. User clicks "Login" on your app: They are redirected to your Auth Center.
2. **Authentication:** The user authenticates with the Auth Center and grants consent for your app to access their information.
3. **Authorization Code:** The Auth Center redirects back to your app with an authorization code.
4. **Exchange Code for Token:** Your app exchanges the authorization code for an access token and an ID token (if using OpenID Connect).
5. **Access Resources:** Your app uses the access token to make API requests on behalf of the user.

#### OpenID Connect Flow:

1. **ID Token:** When your app exchanges the authorization code, it also receives an ID token along with the access token.
2. **UserInfo Endpoint:** The app can send the ID token to a UserInfo endpoint on the Auth Center to retrieve profile information about the user.
3. **Logout:** The Auth Center can manage global logout, invalidating sessions across all apps when the user logs out from one.

### Implementation Steps:

1. **Set up an OAuth 2.0 Server:**

   - AdonisJS can be configured to act as an OAuth 2.0 server using packages like adonisjs/ally for social authentication or other OAuth2 server implementations.

2. **Implement OpenID Connect:**

   - While AdonisJS does not have a built-in OIDC provider, you can implement one using Node.js libraries that support OpenID Connect, such as node-oidc-provider.

3. **Register Your Applications:**

   - Each of your apps will need to be registered with the Auth Center to obtain client IDs and client secrets.

4. **Implement Login/Consent Screens:**

   - You'll need to create user interfaces for login and consent within the Auth Center.

5. **Secure Communication:**

   - Ensure all communication is over HTTPS.
   - Implement necessary security checks, like PKCE (Proof Key for Code Exchange) for public clients.

6. **Client Configuration:**
   - Configure your Nuxt.js apps to use the OAuth 2.0/OpenID Connect flow, likely through a library or plugin that handles the OAuth flow, such as @nuxtjs/auth-next.

By combining OAuth 2.0 with OpenID Connect, you can create a robust and secure authentication center that provides not only authorization capabilities but also reliable authentication and user identity verification.

[Here's a video to understand OAuth2.0](https://www.youtube.com/watch?v=YdShQveywpo&pp=ygUQb2F1dGgyIGV4cGxpcXXDqQ%3D%3D)

[Here's a video to understand OAuth2.0 & OpenID Connect](https://www.youtube.com/watch?v=996OiexHze0&pp=ygUQb2F1dGgyIGV4cGxpcXXDqQ%3D%3D)

## Our Implementation

### Flow explained

Let's dive into the details of the **Authorization Code** flow, which is commonly used by server-side applications and involves several steps for exchanging an authorization code for an access token. Here's how the flow typically works in an AdonisJS environment:

### Step 1: Client Registration

Before anything, the client application (one of your apps) registers with your Adonis Auth Center. The client is provided with a `client_id` and `client_secret`. These credentials are stored securely on the client side.

### Step 2: Authorization Request

When a user wants to log in to one of your client apps using your Auth Center, the client app redirects the user to your Auth Center's authorization endpoint.

**Client App Side:**

```js
// This could be a link or a redirect from your app
window.location.href = `https://auth.yourdomain.com/auth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`
```

### Step 3: User Authentication

The user arrives at the Auth Center's login page, hosted by your Adonis app, and enters their credentials.

**Auth Center (AdonisJS) - Routes:**

```js
// start/routes.js
Route.get('/auth/authorize', 'AuthController.authorize')
```

**Auth Center (AdonisJS) - AuthController:**

```js
// app/Controllers/Http/AuthController.js
async authorize({ view, request }) {
  // The view renders the login page which also includes the logic to handle the authorization request after user submits their credentials.
}
```

### Step 4: User Consent

After authentication, the user is asked to grant permissions to the client app. The Auth Center then generates an authorization code (`app\Models\AuthorizationCode.ts`).
The permissions are the scopes that the client app is requesting. For example, the client app may request access to the user's email address and profile information. But in our case, this is not needed as we are using the Auth Center for authentication only.

### Step 5: Authorization Code Redirection

The Auth Center redirects the user **back to the client app with the authorization code included in the query string**. Why is it in the query string? After the user authenticates and authorizes the application, the authorization server redirects the user back to the client application. The redirection URL is a pre-registered callback URL provided by the client application. The authorization code is added to this URL as a query parameter so that the client application can extract it and use it in the next step of the flow.

To ensure this process is secure, the following requirements must be met:

- The authorization server must require the use of TLS/SSL to protect the code in transit.
- The client must validate that the redirect URI matches the pre-registered URI to prevent redirection attacks.
- Authorization codes should be time-limited and single-use to minimize the window of opportunity for interception or replay attacks.

**Auth Center (AdonisJS) - AuthController:**

```js
// app/Controllers/Http/AuthController.js
async authorize({ auth, request, response }) {
  const user = await auth.attempt(email, password); // Authenticate the user
  // Generate the authorization code
  const code = await AuthorizationCode.createForUser(user);

  // Redirect back to the client app with the code
  response.redirect(`${redirect_uri}?code=${code}`);
}
```

### Step 6: Access Token Request

The client app now have the authorization code, and can exchanges it for an access token by making a POST request to the Auth Center's token endpoint.
**Client App Side:**

```js
// The client app backend makes this request
axios.post('https://auth.yourdomain.com/auth/token', {
  client_id: client_id,
  client_secret: client_secret,
  code: code,
  grant_type: 'authorization_code',
  redirect_uri: redirect_uri,
})
```

### Step 7: Access Token Response

The Auth Center validates the authorization code, client ID, and client secret. If the validation is successful, it responds with an access token (and possibly a refresh token).

**Auth Center (AdonisJS) - AuthController:**

```js
// app/Controllers/Http/AuthController.js
async token({ request, response }) {
  // Validate the authorization code and client credentials
  // If validation is successful
  const token = await OAuthToken.createForUser(user);

  // Respond with the token
  response.json({
    access_token: token.accessToken,
    token_type: 'Bearer',
    expires_in: token.expiresIn,
    refresh_token: token.refreshToken,
    // ... additional data
  });
}
```

### Step 8: Access Protected Resource

The client app can now use the access token to make requests to protected resources on behalf of the user.

**Client App Side:**

```js
// Example of using the access token to access a protected resource
axios.get('https://api.yourdomain.com/protected/resource', {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
})
```

**Auth Center (AdonisJS) - Protected Route Middleware:**

```js
// app/Middleware/OAuthMiddleware.js
async function OAuthMiddleware({ request, response }, next) {
  // Validate the access token
  // If valid, attach user info to the request and call next
  // If not, respond with an error
}
```

In this detailed flow, you would need to fill in the specifics, such as how to handle user sessions, how the consent screen is displayed, and how to securely handle the client secret. It's also important to handle error cases, such as what happens if the user denies consent or if any of the OAuth parameters (like the `redirect_uri`) are invalid.

This flow requires your AdonisJS application to handle user authentication, authorization code generation, code-to-token exchange, token issuance, and token validation

### OAuth 2.0 Server in AdonisJS

#### The library used for this

[Node-OAuth2-Server](https://oauth2-server.readthedocs.io/en/latest/index.html)

Example Usage:

```js
const OAuth2Server = require('oauth2-server')
const Request = OAuth2Server.Request
const Response = OAuth2Server.Response

const oauth = new OAuth2Server({
  model: require('./model'),
})

let request = new Request({
  method: 'GET',
  query: {},
  headers: { Authorization: 'Bearer foobar' },
})

let response = new Response({
  headers: {},
})

oauth
  .authenticate(request, response)
  .then((token) => {
    // The request was successfully authenticated.
  })
  .catch((err) => {
    // The request failed authentication.
  })
```

#### Test the server

##### 1. Authorization Request

First, you'll simulate the authorization request. This is typically initiated by the client (your application) redirecting the user to the authorization server.

- **URL:** Enter the URL for your authorization endpoint (e.g., `http://localhost:3333/oauth/authorize`).
- **Method:** GET.
- **Query Parameters:**
  - `response_type`: Set this to `code`.
  - `client_id`: Use the client ID of the seeded client (`client_1`).
  - `redirect_uri`: Use the redirect URI you've set during seeding (`http://localhost:3333/auth/callback`).
  - `scope`: Define the scope (if your implementation uses scopes).
  - `state`: A random string to maintain state between the request and callback (optional but recommended for security).

Send this request from a browser or as a GET request in Postman. This should redirect you to a login screen.

##### 2. User Authentication

Since you're testing, you'll simulate the user logging in and authorizing the request. This part is usually handled by your server's login form.

- **URL:** The same as the authorization request URL.
- **Method:** POST.
- **Body:** Include the user's credentials (e.g., `test@example.com` and `azerty`) and any other required information.

##### 3. Authorization Code Retrieval

After successful authentication and authorization, your server should redirect to the `redirect_uri` with an authorization code.

- **Extract the Code:** From the redirected URL, extract the `code` parameter.

##### 4. Access Token Request

Now, use Postman to exchange the authorization code for an access token.

- **URL:** The token endpoint (e.g., `http://localhost:3333/oauth/token`).
- **Method:** POST.
- **Headers:** Include a Basic Auth header with the client ID and secret.
- **Body:** Use `x-www-form-urlencoded` and include:
  - `grant_type`: `authorization_code`.
  - `code`: The authorization code you received.
  - `redirect_uri`: Same as above.
  - `client_id`: Client ID if not included in the header.

##### 5. Access Token Response

Upon sending the access token request, you should receive a response containing the access token and other details like `refresh_token`, `expires_in`, etc.

##### 6. Using the Access Token

Finally, you can use this access token to make authenticated requests to your API.

- **URL:** An endpoint in your API that requires authentication.
- **Method:** Depends on what you're accessing.
- **Headers:** Include the `Authorization` header with the value `Bearer <access_token>`.
