// let bowlersIndexes=["2","5"]
// let newBowlers=[
//   {regNumber:"21sclwopl0001",userName:"Sohag Roy",index:"0"},
//   {regNumber:"21sclwopl0002",userName:"Pranab Roy",index:"1"},
//   {regNumber:"21sclwopl0003",userName:"Debarati Roy",index:"2"},
//   {regNumber:"21sclwopl0004",userName:"Somashree Roy",index:"3"},
//   {regNumber:"21sclwopl0005",userName:"Akash Roy",index:"4"},
//   {regNumber:"21sclwopl0006",userName:"Bishal Roy",index:"5"},
//   {regNumber:"21sclwopl0007",userName:"Priom Roy",index:"6"},
//   {regNumber:"21sclwopl0008",userName:"Joy Roy",index:"7"},
// ]

//here index value will be 0,1,2,3...as well
// let previousBowlerIndex="0"
// let activeBowlers=[
//   {regNumber:"21sclwopl0003",userName:"Debarati Roy",index:"0"},
//   {regNumber:"21sclwopl0006",userName:"Bishal Roy",index:"1"},
// ]
//disabling the submit button

let bowlersIndexes=selectedBowlersIndexes
let newBowlers=allBowlers
let previousBowlerIndex=previousBowler
let activeBowlers=addedBowlers

function newBowlersAdd(player) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Name : </strong>${player.userName}</span>
  <span class="item-text"><strong>Reg No : </strong>${player.regNumber}</span>
  <div>
  <button data-id="${player.regNumber}" id="${player.index}" value="${player.userName}" class="newBowlerToAdd btn btn-primary btn-sm">New Bowler</button>
  </div>
  </li>`
}
let newBowlersHTML = newBowlers.map(function(player) {
  return newBowlersAdd(player)
}).join('')
document.getElementById("new-bowlers").insertAdjacentHTML("beforeend", newBowlersHTML)

//all active bowlers to select again

function selectBowlers(player) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Name : </strong>${player.userName}</span>
  <span class="item-text"><strong>Reg No : </strong>${player.regNumber}</span>
  <div>
  <button data-id="${player.regNumber}" id="${player.index}" value="${player.userName}" class="selectBowlerToAdd btn btn-primary btn-sm">New Bowler</button>
  </div>
  </li>`
}
let selectPlayersHTML = activeBowlers.map(function(player) {
  return selectBowlers(player)
}).join('')
document.getElementById("select-bowlers").insertAdjacentHTML("beforeend", selectPlayersHTML)



let addNewBowlersButton=document.getElementsByClassName("newBowlerToAdd")
let addSelectBowlersButton=document.getElementsByClassName("selectBowlerToAdd")
let showNewBowlerName=document.getElementById("newBowler")
let showSelectBowlerName=document.getElementById("selectedBowler")
let resetButton=document.getElementById("resetButton")
resetButton.disabled=true
//variables to store needed values
let newBowlerName
let newBowlerRegNumber
let newBowlerIndex
let selectBowlerIndex
let selectBowlerName
//when playingEleven array list will filledup by 12 players.then this function will run.
function newBowlerReadyToSubmit(){
   for(let i=0;i<addNewBowlersButton.length;i++){
    addNewBowlersButton[i].disabled=true
  }
  document.getElementById("submitNewBowlerButton").disabled=false
}
function selectBowlerReadyToSubmit(){
  for(let i=0;i<addSelectBowlersButton.length;i++){
    addSelectBowlersButton[i].disabled=true
 }
 document.getElementById("submitSelectBowlerButton").disabled=false
}
//after deletion an item this function will be called
function resetActivities(){
        for(let i=0;i<addNewBowlersButton.length;i++){
          if(bowlersIndexes.includes(String(i))){
            addNewBowlersButton[i].disabled=true
            addNewBowlersButton[i].style.backgroundColor="red"
            addNewBowlersButton[i].innerHTML="XX(active)XX"
          }else{
            addNewBowlersButton[i].disabled=false
          }
        }
        for(let i=0;i<addSelectBowlersButton.length;i++){
          if(previousBowlerIndex==String(i)){
            addSelectBowlersButton[i].disabled=true
            addSelectBowlersButton[i].style.backgroundColor="red"
            addSelectBowlersButton[i].innerHTML="X(Just Bowled)X"
          }else{
            addSelectBowlersButton[i].disabled=false
          }
        }
        resetButton.disabled=true
        showNewBowlerName.innerHTML="Select Bowler"
        showSelectBowlerName.innerHTML="Select Bowler"
        document.getElementById("submitSelectBowlerButton").disabled=true
        document.getElementById("submitNewBowlerButton").disabled=true
}

//EVENTS RELATED FUNCTIONALITIES
document.addEventListener("click", function(e) {
  //select player from registered players
  e.preventDefault()
  if (e.target.classList.contains("newBowlerToAdd")) {
    newBowlerRegNumber=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
    newBowlerName=e.target.parentElement.parentElement.querySelector("button").value
    newBowlerIndex=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
    if (confirm(`NEW BOWLER is : ${newBowlerName} `)) {
        resetButton.disabled=false
        showNewBowlerName.innerHTML="New Bowler Name : "+newBowlerName
        newBowlerReadyToSubmit() 
    }
  }

  if (e.target.classList.contains("selectBowlerToAdd")) {
    selectBowlerName=e.target.parentElement.parentElement.querySelector("button").value
    selectBowlerIndex=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
    console.log(selectBowlerIndex)
    if (confirm(`SELECTED BOWLER is : ${selectBowlerName} `)) {
        resetButton.disabled=false
        showSelectBowlerName.innerHTML="Selected Bowler Name : "+selectBowlerName
        selectBowlerReadyToSubmit() 
    }
  }
  
})

resetButton.addEventListener("click",function(){
  resetActivities()
})

//submittion of players list
document.getElementById("submitNewBowlerButton").addEventListener("click", function(e) {
  document.getElementById("newBowlerName").value=newBowlerName
  document.getElementById("newBowlerRegNumber").value=newBowlerRegNumber
  document.getElementById("newBowlerIndex").value=newBowlerIndex
  document.getElementById("newBowlerAddingForm").submit()
})
document.getElementById("submitSelectBowlerButton").addEventListener("click", function(e) {
  document.getElementById("selectBowlerIndex").value=selectBowlerIndex
  document.getElementById("selectBowlerAddingForm").submit()
})
resetActivities()

