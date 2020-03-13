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
            <div class="commits-scroll-area">
              <vue-scroll>
                <b-dropdown-item
                  :key="commit.commit_id"
                  @click="showCommit(commit)"
                  v-for="commit in commits"
                >
                  <b-badge
                    v-if="checkSubmitted(commit.repo_name, commit.commit_id)"
                    variant="success"
                  >
                    <b-icon icon="check"></b-icon>
                  </b-badge>
                  {{commit.repo_name}}:{{commit.commit_id}}
                </b-dropdown-item>
              </vue-scroll>
            </div>
          </b-dropdown>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <b-button pill size="sm" variant="success">Steps: {{steps}}</b-button>
            <!-- <b-form-input class="mr-sm-2" placeholder="Search" size="sm"></b-form-input> -->
            <b-button @click="submitResult()" size="sm" variant="warning">Submit</b-button>
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
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

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

    <sweet-modal icon="success" ref="successModal" title="Success">{{successMessage}}</sweet-modal>
    <sweet-modal icon="warning" ref="alertModal" title="Alert">{{alertMessage}}</sweet-modal>
    <sweet-modal icon="error" ref="errorModal" title="Error">{{errorMessage}}</sweet-modal>

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
                  <div class="card-scroll-area">
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
import { applyDrag, generateItems, getCurrentTime } from './utils/helpers'

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

const pickColor = fileIndex => {
  if (fileIndex < cardColors.length) {
    return cardColors[fileIndex]
  } else {
    let index = fileIndex % cardColors.length
    return cardColors[index]
  }
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
      successMessage: '',
      alertMessage: '',
      errorMessage: '',

      repoName: 'repo',
      commitID: 'commit',
      userName: 'Developer',
      userEmail: '',
      // all commits to be reviewed
      commits: [],
      currentCommit: '',
      submittedCommitIDs: new Set(),
      // steps that the user has taken
      steps: 0,

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
        // ignoreTrimWhitespace: false,
        // smoothScrolling: true
        renderFinalNewline: false
      },

      scrollOptions: {
        wheelDirectionReverse: true
        // keepShow: true
      },

      scene,
      upperDropPlaceholderOptions: {
        className: 'cards-drop-preview',
        animationDuration: '100',
        showOnTop: true
      },
      dropPlaceholderOptions: {
        className: 'drop-preview',
        animationDuration: '100',
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
            // var data = qs.parse(response.data)
            this.commits = response.data

            // show the first commit by default
            this.showCommit(this.commits[0])

            // close the modal
            this.$refs.emailModal.close()
            // allow the user to operate
          } else {
            this.alertMessage = 'No Matching Data for: ' + this.userEmail
            this.$refs.alertModal.open()
          }
        })
        .catch(error => {
          this.errorMessage = error
          this.$refs.errorModal.open()
        })
      // }
    },

    checkSubmitted(repo_name, commit_id) {
      if (this.submittedCommitIDs.has(repo_name + ':' + commit_id)) {
        return true
      } else {
        return false
      }
    },

    showCommit(commit) {
      this.currentCommit = commit
      this.steps = 0

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
          group_id: groups[i].group_id,
          group_label: groups[i].group_label,
          commit_msg: '',
          committed: false, // whether the group has been committed
          // diff hunks
          children: generateItems(groups[i].diff_hunks.length, j => ({
            type: 'draggable',
            id: `${i}${j}`,
            props: {
              className: 'card',
              style: {
                backgroundColor: pickColor(groups[i].diff_hunks[j].file_index)
              }
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
          this.$refs.diffEditor
            .getModifiedEditor()
            .revealLineInCenter(rightStartLine)
          // this.codeLeft = res.data.left_content
          // this.codeRight = res.data.right_content
        })
        .catch(error => {
          this.errorMessage = error
          this.$refs.errorModal.open()
        })
    },

    submitResult() {
      let manualGroups = []
      for (let g of this.scene.children) {
        let diffHunks = []
        for (let d of g.children) {
          diffHunks.push({
            file_index: d.file_index,
            diff_hunk_index: d.diff_hunk_index
          })
        }
        manualGroups.push({
          group_id: g.group_id,
          group_label: g.group_label,
          commit_msg: g.commit_msg,
          diff_hunks: diffHunks
        })
      }

      let manaulResult = {
        email: this.userEmail,
        time: getCurrentTime(),
        steps: this.steps,
        groups: manualGroups
      }

      // this.axois
      //   .post({
      //     url: '/api/saveResult',
      //     method: 'post',
      //     data: qs.stringify({
      //       repo_name: this.repoName,
      //       commit_id: this.commitID,
      //       result: manaulResult,
      //       timestamp: new Date().getTime()
      //     }),
      //     headers: {
      //       'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      //     }
      //   })
      this.axios
        .post(
          '/api/saveResult',
          qs.stringify({
            repo_name: this.repoName,
            commit_id: this.commitID,
            result: manaulResult,
            timestamp: new Date().getTime()
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }
        )
        .then(response => {
          if (response.status == 200) {
            this.submittedCommitIDs.add(this.repoName + ':' + this.commitID)
            let unreviewedNum =
              this.commits.length - this.submittedCommitIDs.size
            if (unreviewedNum <= 0) {
              this.successMessage =
                'Thanks SO MUCH! All commits have been reviewed.'
            } else {
              this.successMessage =
                'Result submitted! ' + unreviewedNum + ' commits left.'
              // jump to the next unreviewed
              for (let next of this.commits) {
                if (
                  !this.submittedCommitIDs.has(
                    next.repo_name + ':' + next.commit_id
                  )
                ) {
                  this.showCommit(next)
                  break
                }
              }
            }
            this.$refs.successModal.open()
          } else {
            this.errorMessage = 'Error! Please email to shenbo@pku.edu.cn.'
            this.$refs.errorModal.open()
          }
        })
        .catch(error => {
          this.errorMessage = error
          this.$refs.errorModal.open()
        })
    },

    onColumnDrop(dropResult) {
      const scene = Object.assign({}, this.scene)
      scene.children = applyDrag(scene.children, dropResult)
      this.scene = scene
      this.steps += 1
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
        console.log(dropResult.removedIndex + '->' + dropResult.addedIndex)
        if (
          !(dropResult.removedIndex !== null && dropResult.addedIndex != null)
        ) {
          this.steps += 0.5
        }
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

.commits-scroll-area {
  /* overflow: auto; */
  height: 40vh;
  /* position: fixed; */
  /* z-index: 2; */
}

.card-scroll-area {
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
