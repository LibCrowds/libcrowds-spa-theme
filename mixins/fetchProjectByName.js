/**
 * Fetch a project by the short_name param and update the store.
 */
export const fetchProjectByName = {
  fetch ({ params, app, error, store }) {
    return app.$axios.$get('/api/project', { params: params }).then(data => {
      console.log(data, params)
      if (!data || data.length !== 1) {
        error({ statusCode: 404, message: 'Page not found' })
        return
      }
      store.dispatch('UPDATE_PROJECT', data[0])
    }).catch(err => {
      error({ statusCode: err.statusCode, message: err.message })
    })
  }
}