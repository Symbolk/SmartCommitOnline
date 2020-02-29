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
      console.log(this.userEmail)
      // query server for repo and commitid

      // init data with the response

      // allow the user to operate
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
