import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Client from 'App/Models/Client'

export default class extends BaseSeeder {
  public async run() {
    await Client.create({
      name: 'client_1',
      secret: 'secret',
      redirectUri: 'http://localhost:3333/auth/callback',
    })
  }
}
