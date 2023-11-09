import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import AuthorizationCode from './AuthorizationCode'
import Token from './Token'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public secret: string

  @column()
  public redirectUri: string

  // Relationships
  // A client can have many tokens
  @hasMany(() => Token)
  public tokens: HasMany<typeof Token>

  // A client can have many authorization codes
  @hasMany(() => AuthorizationCode)
  public authorizationCodes: HasMany<typeof AuthorizationCode>

  // Timestamps
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
