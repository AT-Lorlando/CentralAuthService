import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Token from './Token'
import AuthorizationCode from './AuthorizationCode'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  // serializeAs null means that the password field will not be returned in the response if we use the toJSON method.
  public password: string

  // Relationships
  // A user can have many tokens
  @hasMany(() => Token)
  public tokens: HasMany<typeof Token>

  // A user can have many authorization codes
  @hasMany(() => AuthorizationCode)
  public authorizationCodes: HasMany<typeof AuthorizationCode>

  // Timestamps
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Hash password before saving, this is a hook that will be called before saving the user to the database.
  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
