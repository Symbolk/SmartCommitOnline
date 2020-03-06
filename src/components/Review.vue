<template>
  <div class="hello">
    <!-- NavBar -->
    <b-navbar :sticky="true" toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">SmartCommit</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item active href="#">Hello {{userName}}!</b-nav-item>
          <!-- <b-nav-item disabled href="#">Changes View</b-nav-item> -->
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-item active href="#">{{repoName}}:{{commitID}}</b-nav-item>
          <b-dropdown right size="sm" variant="success">
            <b-dropdown-item
              :key="commit.commit_id"
              @click="showCommit(commit)"
              v-for="commit in commits"
            >{{commit.repo_name}}:{{commit.commit_id}}</b-dropdown-item>
          </b-dropdown>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <!-- <b-form-input class="mr-sm-2" placeholder="Search" size="sm"></b-form-input> -->
            <b-button @click="submitResults()" size="sm" type="submit" variant="warning">Submit</b-button>
          </b-nav-form>

          <!-- <b-nav-item-dropdown right text="Lang">
            <b-dropdown-item href="#">EN</b-dropdown-item>
            <b-dropdown-item href="#">中文</b-dropdown-item>
          </b-nav-item-dropdown>-->

          <!-- <b-nav-item-dropdown right>
            <template v-slot:button-content>
              <em>User</em>
            </template>
            <b-dropdown-item href="#">Settings</b-dropdown-item>
            <b-dropdown-item href="#">Release Note</b-dropdown-item>
          </b-nav-item-dropdown>-->

          <b-nav-form>
            <!-- <b-form-input class="mr-sm-2" placeholder="Search" size="sm"></b-form-input> -->
            <b-button @click="showExitModal()" class="my-2 my-sm-0" size="sm" variant="danger">Exit</b-button>
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <sweet-modal icon="info" overlay-theme="dark" ref="exitModal">
      <b>Are You Sure to Exit?</b>
      <b-button @click="exit()" class="right-button" variant="outline-danger">Yes</b-button>
    </sweet-modal>

    <!-- Main UI -->
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
        <b-input-group-prepend is-text>
          <b-icon icon="envelope"></b-icon>
        </b-input-group-prepend>
        <b-form-input placeholder="me@example.com" type="email" v-model="userEmail"></b-form-input>

        <b-input-group-append>
          <b-button @click="submitEmail()" text="Button" variant="success">Submit</b-button>
        </b-input-group-append>
      </b-input-group>
      <!-- <sweet-button @click="submitEmail()" slot="button" variant="success">Submit</sweet-button> -->
    </sweet-modal>
    <!-- <b-container> -->
    <b-row align-v="start" no-gutters>
      <b-col class="group-view">
        <div class="card-scene">
          <vue-scroll :ops="scrollOptions">
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
                    <span class="column-drag-handle" title="Drag to Move" v-b-tooltip.hover>
                      <b-icon icon="document-diff" scale="1.5"></b-icon>
                    </span>
                    {{ column.group_label }}
                  </div>
                  <div class="scroll-area">
                    <vue-scroll>
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
                          <div
                            :class="card.props.className"
                            :style="card.props.style"
                            @dblclick="showDiff(card.a_hunk, card.b_hunk)"
                            class="no-select"
                          >
                            <p title="Double Click to Show Diff" v-b-tooltip.hover>
                              {{ card.a_hunk.git_path }}:{{card.a_hunk.start_line}}-{{card.a_hunk.end_line}}
                              <b-badge pill style="float:right">Old</b-badge>
                            </p>
                            <p>
                              {{ card.b_hunk.git_path }}:{{card.b_hunk.start_line}}-{{card.b_hunk.end_line}}
                              <b-badge pill style="float:right" variant="success">New</b-badge>
                            </p>
                          </div>
                        </Draggable>
                      </Container>
                    </vue-scroll>
                  </div>
                </div>
              </Draggable>
            </Container>
          </vue-scroll>
        </div>
      </b-col>
    </b-row>

    <b-row no-gutters>
      <b-col>
        <h6>
          {{pathLeft}}
          <b-badge>Old</b-badge>
        </h6>
      </b-col>
      <b-col>
        <h6>
          {{pathRight}}
          <b-badge variant="success">New</b-badge>
        </h6>
      </b-col>
    </b-row>

    <b-row align-v="center" no-gutters>
      <b-col class="diff-view">
        <MonacoEditor
          :diffEditor="true"
          :language="language"
          :options="sideOptions"
          :original="codeLeft"
          :value="codeRight"
          class="editor"
          ref="diffEditor"
        />
      </b-col>
    </b-row>
    <!-- </b-container> -->
  </div>
</template>

<script>
import { SweetModal } from 'sweet-modal-vue'
import { Container, Draggable } from 'vue-smooth-dnd'
import { applyDrag, generateItems } from './utils/helpers'

import qs from 'qs'
import MonacoEditor from './vue-monaco'

const cardColors = [
  'azure',
  'beige',
  'bisque',
  'blanchedalmond',
  'burlywood',
  'cornsilk',
  'gainsboro',
  'ghostwhite',
  'ivory',
  'khaki'
]
const pickColor = () => {
  const rand = Math.floor(Math.random() * 10)
  return cardColors[rand]
}
const scene = {
  type: 'container',
  props: {
    orientation: 'horizontal'
  },
  children: []
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
      repoName: 'repo',
      commitID: 'commit',
      userName: 'Developer',
      userEmail: '',
      // all commits to be reviewed
      commits: [],
      currentCommit: '',

      language: 'java',
      pathLeft: 'Double Click a Card to View Diff',
      pathRight: 'Double Click a Card to View Diff',
      codeLeft: 'Old Content',
      codeRight: 'New Content',
      // diff editor options
      sideOptions: {
        selectOnLineNumbers: true,
        readOnly: true,
        renderSideBySide: true,
        ignoreTrimWhitespace: false,
        // smoothScrolling: true
      },

      scrollOptions: {
        wheelDirectionReverse: true
        // keepShow: true
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
      // if (this.email !== '' && this.email.length > 0) {
      // query server for repo and commitid
      this.axios
        // .get('/api/getData/?email=' + this.userEmail)
        .get('/api/getData', {
          params: { email: this.userEmail }
        })
        // .post('/api/getData', qs.stringify({ email: this.userEmail }))
        .then(response => {
          if (response.data.length > 0) {
            // with or without qs seems ok
            // console.log(response.data[0].repo_name)
            // fit the data with response
            var data = qs.parse(response.data)
            this.commits = data

            // show the first commit by default
            this.showCommit(data[0])

            // close the modal
            this.$refs.emailModal.close()
            // allow the user to operate
          } else {
            console.log('No Matching Data.')
          }
        })
        .catch(error => {
          console.log(error)
        })
      // }
    },

    showCommit(commit) {
      this.currentCommit = commit

      this.userName = this.currentCommit.committer_name
      this.repoName = this.currentCommit.repo_name
      this.commitID = this.currentCommit.commit_id
      var groups = this.currentCommit.groups

      this.scene = {
        type: 'container',
        props: {
          orientation: 'horizontal'
        },
        // groups
        children: generateItems(groups.length, i => ({
          id: i,
          type: 'container',
          name: `Group ${i}`,
          props: {
            orientation: 'vertical',
            className: 'card-container'
          },
          group_label: groups[i].group_label,
          commit_message: '',
          committed: false, // whether the group has been committed
          // diff hunks
          children: generateItems(groups[i].diff_hunks.length, j => ({
            type: 'draggable',
            id: `${i}${j}`,
            props: {
              className: 'card',
              style: { backgroundColor: pickColor() }
            },
            file_index: groups[i].diff_hunks[j].file_index,
            diff_hunk_index: groups[i].diff_hunks[j].diff_hunk_index,
            change_type: groups[i].diff_hunks[j],
            a_hunk: groups[i].diff_hunks[j].a_hunk,
            b_hunk: groups[i].diff_hunks[j].b_hunk
          }))
        }))
      }
    },

    // show diff when user double click
    showDiff(a_hunk, b_hunk) {
      this.pathLeft = a_hunk.git_path
      this.pathRight = b_hunk.git_path
      var leftStartLine = a_hunk.start_line
      var rightStartLine = b_hunk.start_line
      // var leftEndLine = a_hunk.end_line
      // var rightEndLine = b_hunk.end_line
      this.axios
        .get('/api/getFileContents', {
          params: {
            left_file_path: a_hunk.file_path,
            right_file_path: b_hunk.file_path
          }
        })
        .then(res => {
          const monaco = require('monaco-editor')
          this.$refs.diffEditor.getEditor().setModel({
            original: monaco.editor.createModel(
              res.data.left_content,
              this.language
            ),
            modified: monaco.editor.createModel(
              res.data.right_content,
              this.language
            )
          })
          // if (leftEndLine < leftStartLine) {
          //   leftEndLine = leftStartLine
          // }
          // this.$refs.diffEditor
          //   .getEditor()
          //   .revealRangeAtTop(
          //     new monaco.Range(leftStartLine, 1, leftEndLine, 1)
          //   )
          this.$refs.diffEditor.getEditor().revealLineInCenter(leftStartLine)
          this.$refs.diffEditor.getModifiedEditor().revealLineInCenter(rightStartLine)
          // this.codeLeft = res.data.left_content
          // this.codeRight = res.data.right_content
        })
        .catch(error => {
          console.log(error)
        })
    },

    showExitModal() {
      this.$refs.exitModal.open()
    },
    submitResults() {},
    exit() {},

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

p {
  margin: 0;
  font-size: 12px;
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
  height: 42vh;
}

.scroll-area {
  /* overflow: auto; */
  height: 35vh;
  /* position: fixed; */
  /* z-index: 2; */
  padding: 5px;
}

.diff-view {
  height: 38vh;
}

.editor {
  height: 48vh;
}
</style>
