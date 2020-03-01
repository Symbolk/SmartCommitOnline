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
    <b-container>
      <b-row align-v="start" class="group-view">
        <b-col cols="12">
          <div class="card-scene">
            <Container
              :drop-placeholder="upperDropPlaceholderOptions"
              @drag-start="dragStart"
              @drop="onColumnDrop($event)"
              drag-handle-selector=".column-drag-handle"
              orientation="horizontal"
            >
              <Draggable :key="column.id" v-for="column in scene.children">
                <div :class="column.props.className">
                  <div class="card-column-header">
                    <span class="column-drag-handle">&#x2630;</span>
                    {{ column.name }}
                  </div>
                  <Container
                    :drop-placeholder="dropPlaceholderOptions"
                    :get-child-payload="getCardPayload(column.id)"
                    @drag-end="(e) => log('drag end', e)"
                    @drag-start="(e) => log('drag start', e)"
                    @drop="(e) => onCardDrop(column.id, e)"
                    drag-class="card-ghost"
                    drop-class="card-ghost-drop"
                    group-name="col"
                  >
                    <Draggable :key="card.id" v-for="card in column.children">
                      <div :class="card.props.className" :style="card.props.style">
                        <p>{{ card.data }}</p>
                      </div>
                    </Draggable>
                  </Container>
                </div>
              </Draggable>
            </Container>
          </div>
        </b-col>
      </b-row>

      <b-row align-v="center" class="diff-view">
        <MonacoEditor
          :diffEditor="true"
          :language="language"
          :options="sideOptions"
          :original="codeLeft"
          :value="codeRight"
          class="editor"
          ref="sideDiffEditor"
        />
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { SweetModal } from 'sweet-modal-vue'
import { Container, Draggable } from 'vue-smooth-dnd'
import { applyDrag, generateItems } from './utils/helpers'

import qs from 'qs'
import MonacoEditor from './vue-monaco'

const lorem = `Lorem.`
const columnNames = ['Lorem', 'Ipsum', 'Consectetur', 'Eiusmod']
// const cardColors = [
//   'azure',
//   'beige',
//   'bisque',
//   'blanchedalmond',
//   'burlywood',
//   'cornsilk',
//   'gainsboro',
//   'ghostwhite',
//   'ivory',
//   'khaki'
// ]
// const pickColor = () => {
//   const rand = Math.floor(Math.random() * 10)
//   return cardColors[rand]
// }
const scene = {
  type: 'container',
  props: {
    orientation: 'horizontal'
  },
  children: generateItems(4, i => ({
    id: `column${i}`,
    type: 'container',
    name: columnNames[i],
    props: {
      orientation: 'vertical',
      className: 'card-container'
    },
    children: generateItems(+(Math.random() * 10).toFixed() + 5, j => ({
      type: 'draggable',
      id: `${i}${j}`,
      props: {
        className: 'card',
        style: {}
      },
      data: lorem.slice(0, Math.floor(Math.random() * 150) + 30)
    }))
  }))
}

export default {
  name: 'Review',
  components: {
    Container,
    Draggable,
    MonacoEditor,
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
      userEmail: '',

      language: 'javascript',
      codeLeft: '',
      codeRight: '',
      // diff editor options
      sideOptions: {
        // selectOnLineNumbers: true
        readOnly: true,
        renderSideBySide: true
      },

      scene,
      upperDropPlaceholderOptions: {
        className: 'cards-drop-preview',
        animationDuration: '150',
        showOnTop: true
      },
      dropPlaceholderOptions: {
        className: 'drop-preview',
        animationDuration: '150',
        showOnTop: true
      }
    }
  },
  methods: {
    submitEmail() {
      console.log(qs.stringify({ email: this.userEmail }))
      // query server for repo and commitid
      this.axios
        // .get('/api/getData/?email=' + this.userEmail)
        .get('/api/getData', {
          params: { email: this.userEmail }
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
    },
    onColumnDrop(dropResult) {
      const scene = Object.assign({}, this.scene)
      scene.children = applyDrag(scene.children, dropResult)
      this.scene = scene
    },
    onCardDrop(columnId, dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const scene = Object.assign({}, this.scene)
        const column = scene.children.filter(p => p.id === columnId)[0]
        const columnIndex = scene.children.indexOf(column)
        const newColumn = Object.assign({}, column)
        newColumn.children = applyDrag(newColumn.children, dropResult)
        scene.children.splice(columnIndex, 1, newColumn)
        this.scene = scene
      }
    },
    getCardPayload(columnId) {
      return index => {
        return this.scene.children.filter(p => p.id === columnId)[0].children[
          index
        ]
      }
    },
    dragStart() {
      console.log('drag started')
    },
    log(...params) {
      console.log(...params)
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

.no-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.column-drag-handle:hover {
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.no-select:hover {
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.no-select:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}

.group-view {
  height: 40vh;
}

.diff-view {
  height: 40vh;
}
</style>
