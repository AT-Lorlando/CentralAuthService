import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Client from './Client'
import User from './User'

enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public clientId: number

  @column()
  public token: string

  // There are two types of tokens: access and refresh.
  // Access tokens are used to access protected resources,
  // while refresh tokens are used to get new access tokens.
  @column()
  public type: TokenType

  // Relationships
  // A token belongs to a user
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  // A token belongs to a client
  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  @column.dateTime()
  public expiresAt: DateTime

  // Timestamps
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Hash token before saving, this is a hook that will be called before saving the token to the database.
  @beforeSave()
  public static async hashToken(token: Token) {
    if (token.$dirty.token) {
      token.token = await Hash.make(token.token)
    }
  }
}
