<template>
  <card-base
    :title="title"
    :description="description"
    docs="/admin/user-management/">

    <div slot="controls" class="d-flex align-items-center float-md-right">
      <b-btn
        variant="success"
        size="sm"
        @click="download('csv')">
        Export All
      </b-btn>
    </div>

    <p slot="guidance">
      Use the search box below to locate users by name in order to view
      their details or assign admin rights.
    </p>
    <hr class="my-1">

    <pybossa-form
      ref="search"
      :show-footer="false"
      :form="form"
      @response="onResponse">
      <b-input-group slot="bottom">
        <b-form-input
          v-model="form.model.user"
          size="sm"
          placeholder="Search by name"
          @keyup.enter.native="submitSearchForm">
        </b-form-input>
        <b-input-group-append>
          <b-btn
            variant="success"
            :disabled="searching"
            @click="submitSearchForm">
            Search
          </b-btn>
        </b-input-group-append>
      </b-input-group>
    </pybossa-form>

    <b-card-body class="pt-0">
      <div class="d-flex">
        <no-ssr>
          <toggle-button
            :value="showAdmins"
            :sync="true"
            :labels="true"
            @change="showAdmins = !showAdmins">
          </toggle-button>
        </no-ssr>
        <label class="ml-1 mb-0 toggle-label text-secondary">
          <strong>Always show admins</strong>
        </label>
      </div>
    </b-card-body>

    <b-table
      responsive
      striped
      hover
      outlined
      show-empty
      :dark="darkMode"
      :items="tableItems"
      :fields="tableFields">
      <template slot="action" slot-scope="row">
        <b-btn
          variant="info"
          size="sm"
          @click.stop="row.toggleDetails">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
        </b-btn>
        <b-btn
          :variant="row.item.admin ? 'warning' : 'success'"
          size="sm"
          @click="toggleAdmin(row.item)">
          {{ row.item.admin ? 'Revoke admin rights' : 'Grant admin rights' }}
        </b-btn>
      </template>
      <template slot="row-details" slot-scope="row">
        <b-card
          :bg-variant="darkMode ? 'dark' : null"
          :text-variant="darkMode ? 'white' : null">
          <ul class="list-unstyled">
            <li v-for="(key, index) in Object.keys(row.item)" :key="index">
              <strong>{{ key }}: </strong>{{ row.item[key] }}
            </li>
          </ul>
        </b-card>
      </template>
    </b-table>

  </card-base>
</template>

<script>
import { metaTags } from '@/mixins/metaTags'
import { exportFile } from '@/mixins/exportFile'
import CardBase from '@/components/cards/Base'
import PybossaForm from '@/components/forms/PybossaForm'

export default {
  layout: 'admin-site-dashboard',

  mixins: [ exportFile, metaTags ],

  data () {
    return {
      title: 'User Management',
      description: 'Manage the platform\'s registered users.',
      users: [],
      tableFields: {
        fullname: {
          label: 'Name',
          sortable: true
        },
        action: {
          label: 'Actions',
          class: 'text-center'
        }
      },
      searching: false,
      showAdmins: true
    }
  },

  asyncData ({ app, error }) {
    return app.$axios.$get('/admin/users').then(data => {
      return {
        adminUsers: data.users.map(user => {
          user._showDetails = false
          return user
        }),
        found: data.found,
        form: {
          endpoint: '/admin/users',
          method: 'post',
          model: data.form,
          schema: {
            fields: []
          }
        }
      }
    }).catch(err => {
      error(err)
    })
  },

  components: {
    PybossaForm,
    CardBase
  },

  computed: {
    tableItems () {
      let usersCopy = JSON.parse(JSON.stringify(this.users))

      // Prepend admin users
      if (this.showAdmins) {
        usersCopy = this.adminUsers.concat(usersCopy.filter(u => (!u.admin)))
      }

      return usersCopy
    }
  },

  methods: {
    /**
     * Handle form response data.
     */
    onResponse (data) {
      this.searching = false
      if (data.hasOwnProperty('form') && data.hasOwnProperty('found')) {
        this.form.model = data.form
        this.users = data.found.map(user => {
          user._showDetails = false
          return user
        })
      }
    },

    /**
     * Submit the search form.
     */
    submitSearchForm () {
      this.searching = true
      this.$refs.search.submit()
    },

    /**
     * Add or remove a user's admin rights.
     * @param {Object} user
     *   The user.
     */
    toggleAdmin (user) {
      this.$axios.$put(`/api/user/${user.id}`, {
        admin: !user.admin
      }).then(data => {
        user.admin = !user.admin
      }).catch(err => {
        this.$nuxt.error(err)
      })
    },

    /**
     * Download the user data.
     * @param {String} format
     *   The format to export.
     */
    download (format) {
      this.$axios.$get(`/admin/users/export`, {
        responseType: 'arraybuffer',
        params: {
          format: format
        }
      }).then(data => {
        this.exportFile(data, 'user_data', format)
      }).catch(err => {
        this.$nuxt.error(err)
      })
    }
  }
}
</script>
