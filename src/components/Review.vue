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
          <b-nav-item active id="repo-commit">
            {{repoName}}:
            <b @dblclick="selectText">{{commitID}}</b>
          </b-nav-item>

          <b-popover
            :title="`Original Commit Message @ ${commitTime}`"
            placement="bottom"
            target="repo-commit"
            triggers="hover focus"
          >{{originalMsg}}</b-popover>

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
        <!-- &nbsp;&nbsp;&nbsp; -->
        <b-button
          @click="notComposite()"
          pill
          size="sm"
          style="margin-left:5px;"
          title="So you think this is not a composite commit?"
          v-b-tooltip.hover
          variant="outline-danger"
        >Not Composite?</b-button>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-form>
            <b-button
              pill
              size="sm"
              title="Number of taken operations to adjust the result."
              v-b-tooltip.hover
              variant="success"
            >Steps: {{steps}}</b-button>
            <!-- <b-form-input class="mr-sm-2" placeholder="Search" size="sm"></b-form-input> -->
            <b-button @click="showSubmitModal()" size="sm" variant="warning">Submit</b-button>
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
      title="Please input your Github Account Email to start:"
    >
      <b-input-group>
        <template v-slot:prepend>
          <b-input-group-text>Email</b-input-group-text>
        </template>
        <b-input-group-prepend is-text>
          <b-icon icon="envelope"></b-icon>
        </b-input-group-prepend>
        <b-form-input
          placeholder="me@example.com"
          type="email"
          v-model="userEmail"
          v-on:keyup.enter="submitEmail()"
        ></b-form-input>

        <b-input-group-append>
          <b-button @click="submitEmail()" text="Button" variant="success">Submit</b-button>
        </b-input-group-append>
      </b-input-group>
    </sweet-modal>

    <sweet-modal icon="info" ref="submitModal" title="Submit">
      <h5>{{submitMsg}}</h5>
      <br />
      <b-input-group>
        <template v-slot:prepend>
          <b-input-group-text>Feedback</b-input-group-text>
        </template>
        <b-form-textarea
          placeholder="Any suggestions or comments are appreciated"
          v-model="feedback"
        ></b-form-textarea>

        <template v-slot:append>
          <b-dropdown :text="score" variant="success">
            <b-dropdown-item
              :key="s.id"
              @click="setScore(s.value)"
              v-for="s in scoreValues"
            >{{s.label}}</b-dropdown-item>
          </b-dropdown>
          <b-button @click="submitResult()" text="Submit" variant="warning">Submit</b-button>
        </template>
      </b-input-group>
      <!-- <sweet-button @click="submitResult()" slot="button" variant="success">Submit</sweet-button> -->
    </sweet-modal>

    <sweet-modal icon="success" ref="successModal" title="Success">{{successMsg}}</sweet-modal>
    <sweet-modal icon="warning" ref="alertModal" title="Alert">{{alertMsg}}</sweet-modal>
    <sweet-modal icon="error" ref="errorModal" title="Error">{{errorMsg}}</sweet-modal>

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
                        @drag-end="(e) => log()"
                        @drag-start="(e) => log()"
                        @drop="(e) => onCardDrop(column.id, e)"
                        drag-class="card-ghost"
                        drop-class="card-ghost-drop"
                        group-name="col"
                      >
                        <Draggable :key="card.id" v-for="card in column.children">
                          <div
                            :class="card.props.className"
                            :style="card.props.style"
                            @click="showDiff(card.a_hunk, card.b_hunk, card.description)"
                            class="no-select"
                            title="Click to Show Diff & Drag to Move"
                            v-b-tooltip.hover
                          >
                            <p>
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
              <b-button @click="appendNewGroup" variant="outline-success">+ New Group</b-button>
            </Container>
          </vue-scroll>
        </div>
      </b-col>
    </b-row>

    <b-row no-gutters>
      <b-col>
        <h6>
          {{pathLeft}}:{{startLineLeft}}-{{endLineLeft}}
          <b-badge>Old</b-badge>
        </h6>
      </b-col>
      <b-col>
        <h6>
          {{pathRight}}:{{startLineRight}}-{{endLineRight}}
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
      successMsg: '',
      alertMsg: '',
      errorMsg: '',
      submitMsg: '',

      repoName: 'repo',
      userName: 'Developer',
      userEmail: '',

      commitID: 'commit', // str
      commitTime: '', // str
      originalMsg: '',

      currentCommit: '', // object
      // all commits to be reviewed
      commits: [],
      submittedCommitIDs: new Set(),
      // feedbacks collected from the user
      steps: 0,
      actions: [], // the list of moving actions of the user
      score: 'Rate',
      scoreValues: [
        {
          id: 1,
          value: '1',
          label: 'Bad'
        },
        {
          id: 2,
          value: '2',
          label: 'Not Bad'
        },
        {
          id: 3,
          value: '3',
          label: 'Neutral'
        },
        {
          id: 4,
          value: '4',
          label: 'Good'
        },
        {
          id: 5,
          value: '5',
          label: 'Perfect'
        }
      ],
      feedback: '',
      // temp workaround for move action
      fromCard: 'null:null',
      toCard: 'null:null',

      // code related data
      language: 'java',
      pathLeft: 'Double Click a Card to View Diff',
      pathRight: 'Double Click a Card to View Diff',
      startLineLeft: '',
      endLineLeft: ')',
      startLineRight: '',
      endLineRight: ')',
      codeLeft: 'Old Content',
      codeRight: 'New Content',
      // diff editor options
      sideOptions: {
        selectOnLineNumbers: true,
        readOnly: true,
        renderSideBySide: true,
        glyphMargin: true,
        // rulers: [1, 2, 3],
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
            this.alertMsg = 'No Matching Data for: ' + this.userEmail
            this.$refs.alertModal.open()
          }
        })
        .catch(error => {
          this.errorMsg = error
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
      this.actions = []

      this.userName = this.currentCommit.committer_name
      this.repoName = this.currentCommit.repo_name
      this.commitID = this.currentCommit.commit_id
      this.commitTime = this.currentCommit.commit_time
      this.originalMsg = this.currentCommit.commit_msg
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
            change_type: groups[i].diff_hunks[j].change_type,
            description: groups[i].diff_hunks[j].description,
            a_hunk: groups[i].diff_hunks[j].a_hunk,
            b_hunk: groups[i].diff_hunks[j].b_hunk
          }))
        }))
      }
    },

    // show diff when user double click
    showDiff(a_hunk, b_hunk, description) {
      this.pathLeft = a_hunk.git_path
      this.pathRight = b_hunk.git_path
      this.startLineLeft = a_hunk.start_line
      this.startLineRight = b_hunk.start_line
      this.endLineLeft = a_hunk.end_line
      this.endLineRight = b_hunk.end_line

      this.$bvToast.hide()
      this.$bvToast.toast(description, {
        title: 'Change Actions',
        toaster: 'b-toaster-bottom-center',
        solid: true,
        variant: 'success',
        // appendToast: false,
        noAutoHide: true
      })

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
          // this.$refs.diffEditor
          //   .getEditor()
          //   .revealRangeAtTop(
          //     new monaco.Range(leftStartLine, 1, leftEndLine, 1)
          //   )
          this.$refs.diffEditor
            .getEditor()
            .revealLinesInCenter(this.startLineLeft, this.endLineLeft)
          this.$refs.diffEditor
            .getModifiedEditor()
            .revealLinesInCenter(this.startLineRight, this.endLineRight)
          // this.codeLeft = res.data.left_content
          // this.codeRight = res.data.right_content
        })
        .catch(error => {
          this.errorMsg = error
          this.$refs.errorModal.open()
        })
    },

    appendNewGroup() {
      const scene = Object.assign({}, this.scene)
      let newGroupID = this.scene.children.length
      scene.children.push({
        id: newGroupID,
        type: 'container',
        name: `Group ${newGroupID}`,
        props: {
          orientation: 'vertical',
          className: 'card-container'
        },
        group_id: 'group ${newGroupID}',
        group_label: 'NEW',
        commit_msg: '',
        committed: false,
        children: []
      })
      this.scene = scene
    },

    showSubmitModal() {
      this.submitMsg = 'Rate & Comment the grouping results before submission?'
      this.$refs.submitModal.open()
    },

    notComposite() {
      // put all diff hunks in one group to be non-composite
      let manualGroups = []
      let diffHunks = []

      for (let g of this.scene.children) {
        for (let d of g.children) {
          diffHunks.push({
            file_index: d.file_index,
            diff_hunk_index: d.diff_hunk_index
          })
        }
      }
      manualGroups.push({
        group_id: '0',
        group_label: 'no-composite',
        commit_msg: 'no-composite',
        diff_hunks: diffHunks
      })
      let manualResult = {
        email: this.userEmail,
        time: getCurrentTime(),
        steps: this.steps,
        actions: this.actions,
        groups: manualGroups,
        score: 0, // 0 = no-composite
        feedback: this.feedback
      }
      this.axios
        .post(
          '/api/saveResult',
          qs.stringify({
            repo_name: this.repoName,
            commit_id: this.commitID,
            result: manualResult,
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
              this.successMsg =
                'Thanks SO MUCH! All commits have been reviewed.'
            } else {
              this.successMsg =
                'Recorded as a non-composite commit! ' + unreviewedNum + ' commits left.'
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
            setTimeout(() => {
              this.$refs.successModal.close()
            }, 3000)
          } else {
            this.errorMsg =
              'Error! Please send the screenshot to shenbo@pku.edu.cn.'
            this.$refs.errorModal.open()
          }
        })
        .catch(error => {
          this.errorMsg = error
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

      let score = this.score
      if (isNaN(score)) {
        score = 0
      } else {
        score = Number(score)
      }
      let manualResult = {
        email: this.userEmail,
        time: getCurrentTime(),
        steps: this.steps,
        actions: this.actions,
        groups: manualGroups,
        score: score,
        feedback: this.feedback
      }

      // this.axois
      //   .post({
      //     url: '/api/saveResult',
      //     method: 'post',
      //     data: qs.stringify({
      //       repo_name: this.repoName,
      //       commit_id: this.commitID,
      //       result: manualResult,
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
            result: manualResult,
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
              this.successMsg =
                'Thanks SO MUCH! All commits have been reviewed.'
            } else {
              this.successMsg =
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
            this.$refs.submitModal.close()
            this.score = 'Rate'
            this.feedback = ''
            setTimeout(() => {
              this.$refs.successModal.close()
            }, 3000)
          } else {
            this.errorMsg =
              'Error! Please send the screenshot to shenbo@pku.edu.cn.'
            this.$refs.errorModal.open()
          }
        })
        .catch(error => {
          this.errorMsg = error
          this.$refs.errorModal.open()
        })
    },
    // rating and comments
    setScore(score) {
      this.score = score
    },

    selectText(e) {
      if (document.body.createTextRange) {
        var range = document.body.createTextRange()
        range.moveToElementText(e.target)
        range.select()
      } else {
        let selection = window.getSelection()
        let range = document.createRange()
        range.selectNodeContents(e.target)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    },

    onColumnDrop(dropResult) {
      const scene = Object.assign({}, this.scene)
      scene.children = applyDrag(scene.children, dropResult)
      this.scene = scene
      this.steps += 1
      let action =
        '[Group]' + dropResult.removedIndex + '->' + dropResult.addedIndex

      console.log(action)
      this.actions.push(action)
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
        // a trick to get the action
        if (this.containsNull(this.fromCard)) {
          this.fromCard = columnId + ':' + dropResult.removedIndex
        }
        if (this.containsNull(this.toCard)) {
          this.toCard = newColumn.id + ':' + dropResult.addedIndex
        }

        if (
          !this.containsNull(this.fromCard) &&
          !this.containsNull(this.toCard)
        ) {
          let action = '[Hunk]' + this.fromCard + '->' + this.toCard
          console.log(action)
          this.actions.push(action)
          this.fromCard = 'null:null'
          this.toCard = 'null:null'
        }
        // move to another column
        if (
          !(dropResult.removedIndex !== null && dropResult.addedIndex != null)
        ) {
          this.steps += 0.5
        }
      }
    },
    containsNull(str) {
      return str.indexOf('null') != -1
    },
    getCardPayload(columnId) {
      return index => {
        return this.scene.children.filter(p => p.id === columnId)[0].children[
          index
        ]
      }
    },
    dragStart() {
      // console.log('drag started')
    },
    log() {}
    // log(...params) {
    //   console.log(...params)
    // }
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

h6 {
  margin-left: 10px;
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
