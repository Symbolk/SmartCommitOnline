<template>
  <div class="hello">
    <sweet-modal
      blocking
      hide-close-button
      icon="info"
      modal-theme="light"
      overlay-theme="light"
      ref="emailModal"
      title="Please input your email to continue:"
    >
      <b-input-group>
        <template v-slot:prepend>
          <b-input-group-text>Email</b-input-group-text>
        </template>
        <b-form-input v-model="userEmail"></b-form-input>

        <b-input-group-append>
          <b-button @click="submitEmail()" text="Button" variant="success">Submit</b-button>
        </b-input-group-append>
      </b-input-group>
      <!-- <sweet-button @click="submitEmail()" slot="button" variant="success">Submit</sweet-button> -->
    </sweet-modal>
  </div>
</template>

<script>
import { SweetModal } from 'sweet-modal-vue'
import qs from 'qs'
// import MonacoEditor from './vue-monaco'

export default {
  name: 'Review',
  components: {
    // MonacoEditor,
    SweetModal
    // SweetModalTab
  },
  props: {
    msg: String
  },
  data() {
    return {
      repoName: '',
      commitID: '',
      userEmail: ''
    }
  },
  methods: {
    submitEmail() {
      console.log(qs.stringify({ email: this.userEmail }))
      // query server for repo and commitid
      this.axios
        // .get('/api/getData/?email=' + this.userEmail)
        .get('/api/getData', {
          email: this.userEmail
        })
        // .post('/api/getData', qs.stringify({ email: this.userEmail }))
        .then(response => {
          console.log(response)
          // close the modal
          this.$refs.emailModal.close()
          // fit the data with response
          this.$root.$emit(
            'showNavBar',
            this.repoName,
            this.commitID,
            this.userEmail
          )
          // allow the user to operate
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  mounted() {
    this.$refs.emailModal.open()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
