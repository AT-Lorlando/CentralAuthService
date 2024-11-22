import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Client from './Client'
import User from './User'
import { Token as ServerToken } from 'oauth2-server'

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public clientId: number

  // I'll explain this when I'll understand it better.
  @column()
  public accessToken: string

  @column()
  public refreshToken: string

  // Relationships
  // A token belongs to a user
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  // A token belongs to a client
  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  @column.dateTime()
  public accessTokenExpiresAt: DateTime

  @column.dateTime()
  public refreshTokenExpiresAt: DateTime

  // Timestamps
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Hash token before saving, this is a hook that will be called before saving the token to the database.
  @beforeSave()
  public static async hashToken(token: Token) {
    if (token.$dirty.accessToken) {
      token.accessToken = await Hash.make(token.accessToken)
    }
    if (token.$dirty.refreshToken) {
      token.refreshToken = await Hash.make(token.refreshToken)
    }
  }

  // Methods
  public toServerModel(): ServerToken {
    return {
      accessToken: this.accessToken,
      accessTokenExpiresAt: this.accessTokenExpiresAt.toJSDate(),
      client: this.client.toServerModel(),
      refreshToken: this.refreshToken,
      refreshTokenExpiresAt: this.refreshTokenExpiresAt.toJSDate(),
      user: this.user,
    } as ServerToken
  }
}
