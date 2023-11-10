import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/authorize', 'AuthController.authorize').as('authorize')
  Route.post('/authorize', 'AuthController.doAuthorize')
  Route.post('/token', 'AuthController.token')
  Route.post('/revoke', 'AuthController.revoke')
})
  .prefix('/oauth')
  .middleware('redirectIfNotAuthenticated')

Route.get('/login', 'AuthController.showLogin').as('login')
Route.post('/login', 'AuthController.login')
Route.get('/whoami', 'AuthController.whoami').middleware('auth')
Route.post('/logout', 'AuthController.logout').middleware('auth')
