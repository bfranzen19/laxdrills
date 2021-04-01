console.log('js is linked, yo');

// Vue.component('main-nav', {
//   template: `
//   <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
//       <a class="navbar-brand" href="/" id="brand"> lax drills app </a>
//       <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//         <span class="navbar-toggler-icon"></span>
//       </button>
//       <div class="collapse navbar-collapse" id="navbarNav">
//         <ul class="navbar-nav">
//           <li class="nav-item">
//             <a class="nav-link" href="/about"> about <span class="sr-only">(current)</span></a>
//           </li>
//           <li class="nav-item">
//             <a class="nav-link" href="/search"> search our database <span class="sr-only">(current)</span></a>
//           </li>
//         </ul>
//       </div>
//     </nav>
//   `,
// })
//
// Vue.component('main-footer', {
//   template: `
//     <footer> site designed and maintained by <a id="linkID" v-bind:href='url' target="_blank"> bt franzen </a> </footer>
//   `,
//   props: ['url']
// })
//
// Vue.component('search-results', {
//   template: `
//     <div class="card border-danger mb-3" style="max-width: 100%;">
//       <div id="resultsTitle" class="card-header">
//       {{title}}
//       </div>
//       <div class="card-body text-danger" id="triggerBox">
//         <p id="resultsTrigger" class="card-text"> {{trigger}} </p>
//       </div>
//     </div>
//   `,
//   props: ['id', 'type']
// });
//
// Vue.component('logged-in', {
//   template: `
//     <div id="loginStuff">
//       <hr>
//         <li><a href="/logout">log out</a></li>
//       <hr>
//     </div>
//   `,
// });

var mainVM = new Vue({
  el: '#app',
  data: {

    loginForm: {
      username: '',
      password: '',
    },

    regForm: {
      username: '',
      password: '',
    },

    searchType: '',
    searchId: '',

    searchResults: [],

    visible: true,

    recordsFound: [],

    showValidate: false,

  },

  methods: {
    /*
    searchType: function() { // changed from searchDBtitle
      if(!$.trim(this.searchType)) { alert('please enter a search query'); }
      else {
        $.post('/searchType',{ type: this.searchType }, function(dataFromServer) {
            console.log('this is data from the server --- ', dataFromServer);

            if(dataFromServer.length === 0) {
                mainVM.searchResults.push({
                    id: '',
                    type: 'no drills found'
                });
            }
            else {
                for(let item of dataFromServer) {
                    mainVM.recordsFound = dataFromServer.length;
                    mainVM.searchResults.push({
                        id: item.id,
                        type: item.type,
                    });
                }
            }
        });
      }
      mainVM.searchTitle = "";
    },

    searchId: function() { // changed from searchDBtitle
      if(!$.trim(this.searchId)) { alert('please enter a search query'); }
      else {
        $.post('/searchId',{ id: this.searchId }, function(dataFromServer) {
            console.log('this is data from the server --- ', dataFromServer);

            if(dataFromServer.length === 0) {
                mainVM.searchResults.push({
                    id: '',
                    type: 'no drills found'
                });
            }
            else {
                for(let item of dataFromServer) {
                    mainVM.recordsFound = dataFromServer.length;
                    mainVM.searchResults.push({
                        id: item.id,
                        type: item.type,
                    });
                }
            }
        });
      }
      mainVM.searchTitle = "";
    },
    */
    register: function() {
      $.post('/register', this.regForm, function(dataFromServer) {
        console.log(dataFromServer)
      })
    },

    login: function() {
      $.post('/login', this.loginForm, function(dataFromServer) {
        console.log(dataFromServer)
        console.log(dataFromServer.success)
        if(dataFromServer.success) {
          mainVM.showValidate = true
        } else {
          alert('failed login.')
        }
      })
      mainVM.loginForm.username = ""
      mainVM.loginForm.password = ""
    },

  },
})  // z mainVM
