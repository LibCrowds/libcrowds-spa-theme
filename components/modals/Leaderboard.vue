<template>
  <b-modal
    lazy
    :id="modalId"
    title="Leaderboard"
    ok-only
    :header-text-variant="darkMode ? 'white' : null"
    :header-bg-variant="darkMode ? 'dark' : null"
    :body-bg-variant="darkMode ? 'dark' : null"
    :body-text-variant="darkMode ? 'white' : null"
    :footer-bg-variant="darkMode ? 'dark' : null"
    :footer-text-variant="darkMode ? 'white' : null">
    <b-table
      responsive
      striped
      hover
      show-empty
      :dark="darkMode"
      :items="filteredUsers"
      :fields="fields">
    </b-table>
  </b-modal>
</template>

<script>
export default {
  data () {
    return {
      fields: {
        rank: { label: 'Rank' },
        name: { label: 'Name' },
        score: { label: 'Score' }
      }
    }
  },

  props: {
    topUsers: {
      type: Array,
      required: true
    },
    modalId: {
      type: String,
      required: true
    }
  },

  computed: {
    /**
     * Highlight current user and remove from the end if they appear twice.
     */
    filteredUsers () {
      let users = JSON.parse(JSON.stringify(this.topUsers))

      users = users.map(user => {
        if (this.currentUser && this.currentUser.name === user.name) {
          user._rowVariant = 'success'
        }
        return user
      })

      let userRepeated = users.filter(user => {
        return user.name === this.currentUser.name
      }).length

      if (userRepeated) {
        users.splice(-1, 1)
      }

      return users
    },
    currentUser () {
      return this.$store.state.currentUser
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  tr *:first-child,
  tr *:last-child {
    text-align: center;
  }
}
</style>
