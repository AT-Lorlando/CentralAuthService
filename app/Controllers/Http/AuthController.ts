import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OAuthServer from 'oauth2-server'
import { oauthModel } from 'App/Models/OAuth'
import Client from 'App/Models/Client'

export default class AuthController {
  private oauth = new OAuthServer({ model: oauthModel })
  // Here, we use ServerOptions AuthorizationCodeModel

  public async authorize({ request, response, view, auth }: HttpContextContract) {
    const clientId = parseInt(request.input('client_id'))
    const redirectUri = request.input('redirect_uri')
    const responseType = request.input('response_type')

    if (!clientId || !redirectUri || !responseType) {
      return response.badRequest('Missing parameters')
    }

    const client = await Client.find(clientId)
    if (!client) {
      return response.badRequest('Invalid client')
    }
    if (client.redirectUri !== redirectUri) {
      return response.badRequest('Invalid redirect URI')
    }
    if (responseType !== 'code') {
      return response.badRequest('Invalid response type')
    }

    // Check if the user is already logged in
    if (!auth.user) {
      // Redirect to login page with query parameters intact
      return response
        .redirect()
        .withQs({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: responseType,
        })
        .toRoute('login')
    }

    return view.render('authorize', { client, user: auth.user })
  }

  public async doAuthorize({ request, response, auth }: HttpContextContract) {
    const redirectUri = request.input('redirect_uri')

    // transform request and response to OAuthServer objects
    const oauthRequest = new OAuthServer.Request({
      headers: { ...request.headers() },
      method: request.method(),
      query: { ...request.qs() },
      body: { ...request.body() },
    })

    const oauthResponse = new OAuthServer.Response(response)
    try {
      const code = await this.oauth.authorize(oauthRequest, oauthResponse, {
        authenticateHandler: {
          handle: (request, response) => {
            // Logic to authenticate the user
            // Return the user object after authentication
            return auth.user
          },
        },
      })
      // const code = { authorizationCode: '123456' }
      response.redirect(`${redirectUri}?code=${code.authorizationCode}`)
    } catch (err) {
      response.status(err.code || 500).send(err.message)
    }
  }

  // login page
  public async showLogin({ request, view }: HttpContextContract) {
    return view.render('login', {
      client_id: request.input('client_id'),
      redirect_uri: request.input('redirect_uri'),
      response_type: request.input('response_type'),
    })
  }

  // login post
  public async login({ request, response, auth }: HttpContextContract) {
    const { email, password, rememberMe } = request.all()
    const clientId = request.input('client_id')
    const redirectUri = request.input('redirect_uri')
    const responseType = request.input('response_type')

    try {
      await auth.attempt(email, password, rememberMe)
      return response
        .redirect()
        .withQs({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: responseType,
        })
        .toRoute('authorize')
    } catch (error) {
      return response.badRequest('Invalid credentials')
    }
  }

  public async whoami({ auth, response }) {
    try {
      return response.json(auth.user)
    } catch (error) {
      return response.status(401).json({ message: 'Not logged in' })
    }
  }

  // logout
  public async logout({ auth, response }) {
    await auth.logout()
    return response.json({ message: 'Logged out successfully' })
  }

  // token
  public async token({ request, response }) {
    const oauthRequest = new OAuthServer.Request({
      headers: { ...request.headers() },
      method: request.method(),
      query: { ...request.qs() },
      body: { ...request.body() },
    })

    const oauthResponse = new OAuthServer.Response(response)
    console.log('token')
    try {
      const token = await this.oauth.token(oauthRequest, oauthResponse)
      return response.json(token)
    } catch (err) {
      return response.status(err.code || 500).json(err)
    }
  }
}
