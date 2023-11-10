import LucidAuthorizationCode from 'App/Models/AuthorizationCode'
import LucidToken from 'App/Models/Token'
import LucidClient from 'App/Models/Client'
import LucidUser from 'App/Models/User'
import { TokenType } from 'App/Models/Token'
import { DateTime } from 'luxon'

import {
  AuthorizationCode,
  AuthorizationCodeModel,
  Falsey,
  Token,
  Client,
  User,
} from 'oauth2-server'

// Here, we're gonna use ServerOptions AuthorizationCodeModel type
/* Here's all the methods that we need to implement:
 *
 * __BaseModel__
 * generateAccessToken?
 * getClient
 * saveToken
 * __AuthorizationCodeModel__
 * generateRefreshToken?
 * generateAuthorizationCode?
 * getAuthorizationCode
 * saveAuthorizationCode
 * revokeAuthorizationCode
 * validateScope?
 * __RequestAuthenticationModel__
 * getAccessToken
 * verifyScope
 */
export const oauthModel: AuthorizationCodeModel = {
  // Get client.
  getClient: async (clientId, clientSecret): Promise<Client | Falsey> => {
    console.log('getClient', clientId, clientSecret)
    const client = await LucidClient.query().where('id', clientId).first()

    if (!client) {
      return false
    }

    return client.toServerModel()
  },

  // Save token.
  saveToken: async (token: Token, client: Client, user: User): Promise<Token | Falsey> => {
    console.log('saveToken', token, client, user)
    const databaseClient = await LucidClient.find(client.id)
    const databaseUser = await LucidUser.find(user.id)

    if (!databaseClient || !databaseUser) {
      return false
    }

    const expiresAt = token.accessTokenExpiresAt || new Date(Date.now() + 3600 * 1000)
    const savedToken = await LucidToken.create({
      token: token.accessToken,
      type: TokenType.ACCESS,
      expiresAt: DateTime.fromJSDate(expiresAt),
    })

    await savedToken.related('client').associate(databaseClient)
    await savedToken.related('user').associate(databaseUser)

    return savedToken.toServerModel()
  },

  // Generate access token.
  generateAccessToken: async (): Promise<string> => {
    console.log('generateAccessToken')
    return Math.random().toString(36).substring(2)
  },

  // Generate refresh token.
  generateRefreshToken: async (): Promise<string> => {
    console.log('generateRefreshToken')
    return Math.random().toString(36).substring(2)
  },

  // Generate authorization code.
  generateAuthorizationCode: async (): Promise<string> => {
    console.log('generateAuthorizationCode')
    return Math.random().toString(36).substring(2)
  },

  // Get authorization code.
  getAuthorizationCode: async (authorizationCode): Promise<AuthorizationCode | Falsey> => {
    console.log('getAuthorizationCode', authorizationCode)
    const authCode = await LucidAuthorizationCode.query().where('code', authorizationCode).first()
    return authCode ? authCode.toServerModel() : false
  },

  // Save authorization code.
  saveAuthorizationCode: async (code, client, user): Promise<AuthorizationCode | Falsey> => {
    console.log('saveAuthorizationCode', code, client, user)
    const databaseClient = await LucidClient.find(client.id)
    const databaseUser = await LucidUser.find(user.id)

    if (!databaseClient || !databaseUser) {
      return false
    }

    const expiresAt = code.expiresAt || new Date(Date.now() + 3600 * 1000)
    const authCodeInstance = new LucidAuthorizationCode()
    authCodeInstance.code = code.authorizationCode
    authCodeInstance.expiresAt = DateTime.fromJSDate(expiresAt)

    await authCodeInstance.related('client').associate(databaseClient)
    await authCodeInstance.related('user').associate(databaseUser)
    await authCodeInstance.load('client')
    await authCodeInstance.load('user')

    await authCodeInstance.save()
    return authCodeInstance.toServerModel()
  },

  // Revoke authorization code.
  revokeAuthorizationCode: async (code): Promise<boolean> => {
    console.log('revokeAuthorizationCode', code)
    const authCode = await LucidAuthorizationCode.query().where('code', code.code).first()
    if (authCode) {
      await authCode.delete()
      return true
    }
    return false
  },

  // Get access token.
  getAccessToken: async (accessToken): Promise<Token | Falsey> => {
    console.log('getAccessToken', accessToken)
    const token = await LucidToken.query().where('token', accessToken).first()

    if (!token) {
      return false
    }

    return token.toServerModel()
  },

  // Verify scope.
  verifyScope: async (token, _scope): Promise<boolean> => {
    console.log('verifyScope', token)
    const tokenInstance = await LucidToken.query().where('token', token.accessToken).first()
    if (!tokenInstance) {
      return false
    }

    return true
  },
}
