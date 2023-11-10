import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('client_id').unsigned().references('id').inTable('clients').onDelete('CASCADE')
      table.string('access_token', 255).notNullable()
      table.string('refresh_token', 255).notNullable()
      table.timestamp('access_token_expires_at').notNullable()
      table.timestamp('refresh_token_expires_at').notNullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
