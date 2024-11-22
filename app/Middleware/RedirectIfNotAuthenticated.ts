import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RedirectIfNotAuthenticated {
  public async handle({ auth, response, request }: HttpContextContract, next: () => Promise<void>) {
    // Check if the user is not logged in
    const isLoggedIn = await auth.check()
    if (!isLoggedIn) {
      // Redirect to the login page with the original query string
      const queryString = request.qs()
      const loginUrl = `/login?${new URLSearchParams(queryString).toString()}`
      return response.redirect(loginUrl)
    }
    // Otherwise, proceed with the request
    await next()
  }
}
