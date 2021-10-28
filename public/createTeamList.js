
let registeredPlayers=[]
// {regNumber:"21sclwopl0001",userName:"Sohag Roy"},
// {regNumber:"21sclwopl0002",userName:"Pranab Roy"},
// {regNumber:"21sclwopl0003",userName:"Debarati Roy"},
// {regNumber:"21sclwopl0004",userName:"Somashree Roy"},
// {regNumber:"21sclwopl0005",userName:"Akash Roy"},
// {regNumber:"21sclwopl0006",userName:"Bishal Roy"},
// {regNumber:"21sclwopl0007",userName:"Priom Roy"},
// {regNumber:"21sclwopl0008",userName:"Joy Roy"},
// ]

registeredPlayers=allPlayers
//disabling the submit button
document.getElementById("submit11button").disabled=true
let createField = document.getElementById("create-field")
let remainToAdd = document.getElementById("remainToAdd")
let createdMessage = document.getElementById("createdMessage")
createdMessage.style.display="none"
let remainMessage = document.getElementById("remainMessage")
let showText
function clubPlayersTemplate(player) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Name : </strong>${player.userName}</span>
  <span class="item-text"><strong>Reg No : </strong>${player.regNumber}</span>
  <div>
  <button data-id="${player.regNumber}" value="${player.userName}" class="playing btn btn-primary btn-sm">playing</button>
  </div>
  </li>`
}
let playersHTML = registeredPlayers.map(function(player) {
  return clubPlayersTemplate(player)
}).join('')
document.getElementById("club-players").insertAdjacentHTML("beforeend", playersHTML)
let playingButtons=document.getElementsByClassName("playing")

//All playing 11 players adding template
let playingEleven=[]

function add11Template(player) {
    let regNumber
    if(player.regNumber==player.userName){
      regNumber="Not registered"
    }else{
      regNumber=player.regNumber
    }
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Name : </strong>${player.userName}</span>
  <span class="item-text"><strong>Reg No : </strong>${regNumber}</span>
  <div>
  <button data-id="${player.regNumber}" value="${player.userName}" class="delete-me btn btn-danger btn-sm">Delete</button>
  </div>
  </li>`
}
 
let ourHTML = playingEleven.map(function(player) {
  return add11Template(player)
}).join('')

document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)

//submittion of players list
document.getElementById("add11form").addEventListener("submit", function(e) {
  playingEleven=JSON.stringify(playingEleven);
  document.getElementById("team-11-players").value=playingEleven
  console.log(playingEleven)
})

//when playingEleven array list will filledup by 12 players.then this function will run.
function readyToSubmit(){
  remainMessage.style.display="none"
  createdMessage.style.display="block"
  for(let i=0;i<playingButtons.length;i++){
    playingButtons[i].disabled=true
  }
  document.getElementById("submit11button").disabled=false
  document.getElementById("add-player-button").disabled=true
  console.log(playingEleven)
}
//after deletion an item this function will be called
function resetActivities(){
        remainMessage.style.display="block"
        createdMessage.style.display="none"
        document.getElementById("submit11button").disabled=true
        document.getElementById("add-player-button").disabled=false
        createField.disabled=false
        for(let i=0;i<playingButtons.length;i++){
          playingButtons[i].disabled=false
        }
        if(12-playingEleven.length<=1){
          showText=12-playingEleven.length+" player remains"
        }else{
          showText=12-playingEleven.length+" players remain"
        }
        remainToAdd.innerHTML=showText
}
//adding players on playingEleven list
function  addOnPlayingEleven(player){
  remainMessage.style.display="block"
  createdMessage.style.display="none"
  playingEleven.push(player)
  if(12-playingEleven.length==1){
    showText=12-playingEleven.length+" player remains"
  }else{
    showText=12-playingEleven.length+" players remain"
  }
  remainToAdd.innerHTML=showText
}

//EVENTS RELATED FUNCTIONALITIES
document.getElementById("create-form").addEventListener("submit", function(e) {
  e.preventDefault()
  if(playingEleven.length<12){
    // Create the HTML for a new player
    if(createField.value){
      let player={
        regNumber:createField.value,
        userName:createField.value
      }
      document.getElementById("item-list").insertAdjacentHTML("beforeend", add11Template(player))
      addOnPlayingEleven(player)
      createField.value = ""
      createField.focus()
      if(playingEleven.length==12){
        readyToSubmit()
      }
    }
  }else{
    alert("You can't add more then 12 players in a single team!!")
  }
})

document.addEventListener("click", function(e) {
  //select player from registered players
  if (e.target.classList.contains("playing")) {
    if(playingEleven.length<12){
        let regNumber=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
        let userName=e.target.parentElement.parentElement.querySelector("button").value
        let player={
          regNumber:regNumber,
          userName:userName
        }
        registeredPlayers=registeredPlayers.filter((player)=>{
          if(player.regNumber!=regNumber){
            return player
          }
        })
        addOnPlayingEleven(player)
        e.target.parentElement.parentElement.remove()
        document.getElementById("item-list").insertAdjacentHTML("beforeend", add11Template(player))
        if(playingEleven.length==12){
          readyToSubmit()
        }
      }else{
        alert("You can't add more then 12 players in a single team!!")
      } 
  }


  // Remove player from playing 11
  if (e.target.classList.contains("delete-me")) {
    e.preventDefault()
    let regNumber=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
    let userName=e.target.parentElement.parentElement.querySelector("button").value
    if (confirm(`Do you really want to remove ${userName} from playing 11?`)) {
        let player={
          regNumber:regNumber,
          userName:userName
        }
        //removing selected player from playingEleven array list
        playingEleven=playingEleven.filter((player)=>{
          if(player.regNumber!=regNumber){
            return player
          }
        })
        e.target.parentElement.parentElement.remove()
        //after delition natural activity setting
        resetActivities()
        //adding the registered player on club members list
        if(userName!=regNumber){
          registeredPlayers.push(player)
          document.getElementById("club-players").insertAdjacentHTML("beforeend", clubPlayersTemplate(player))
        }
    }
  }
})




