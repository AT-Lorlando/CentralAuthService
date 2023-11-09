import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import User from './User'

export default class AuthorizationCode extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public clientId: number

  @column()
  public code: string

  // Relationships
  // A token belongs to a user
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  // A token belongs to a client
  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  // Timestamps
  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
