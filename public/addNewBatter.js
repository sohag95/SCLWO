
// let notOutBatters=[
// {regNumber:"21sclwopl0001",userName:"Sohag Roy",index:"0"},
// {regNumber:"21sclwopl0002",userName:"Pranab Roy",index:"1"},
// {regNumber:"21sclwopl0003",userName:"Debarati Roy",index:"2"},
// {regNumber:"21sclwopl0004",userName:"Somashree Roy",index:"3"},
// {regNumber:"21sclwopl0005",userName:"Akash Roy",index:"4"},
// {regNumber:"21sclwopl0006",userName:"Bishal Roy",index:"5"},
// {regNumber:"21sclwopl0007",userName:"Priom Roy",index:"6"},
// {regNumber:"21sclwopl0008",userName:"Joy Roy",index:"7"},
// ]
let notOutBatters=battersList
let enteredBatters=battersIndexes

//disabling the submit button
document.getElementById("submitBatterButton").disabled=true
let showText
function availableBatters(player) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Name : </strong>${player.userName}</span>
  <span class="item-text"><strong>Reg No : </strong>${player.regNumber}</span>
  <div>
  <button data-id="${player.regNumber}" id="${player.index}" value="${player.userName}" class="newBatterToAdd btn btn-primary btn-sm">New Batter</button>
  </div>
  </li>`
}
let playersHTML = notOutBatters.map(function(player) {
  return availableBatters(player)
}).join('')
document.getElementById("available-batters").insertAdjacentHTML("beforeend", playersHTML)

//place for retired hart players
// let allRetiredHurtPlayers=[
//   {
//     userName:"Sohag roy",
//     regNumber:"21sclwopl0002",
//     battedIndex:"2"
//   },{
//     userName:"Debarati roy",
//     regNumber:"21sclwopl0004",
//     battedIndex:"3"
//   },{
//     userName:"Pranab roy",
//     regNumber:"21sclwopl0005",
//     battedIndex:"4"
//   }
// ]
let allRetiredHurtPlayers=retiredHurtPlayersArray
function retiredHurtPlayers(player) {
  return `
  <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Name : </strong>${player.userName}</span>
  <span class="item-text"><strong>Reg No : </strong>${player.regNumber}</span>
  <div>
    <button data-id="${player.userName}" value="${player.battedIndex}" class="retiredHurtButton btn btn-warning btn-sm">Add On Batting</button>
  </div>
  </li>
  `
}
let retirHurtPlayersHTML = allRetiredHurtPlayers.map(function(player) {
  return retiredHurtPlayers(player)
}).join('')
if(!allRetiredHurtPlayers.length){
  retirHurtPlayersHTML=`<button class="btn btn-info btn-lg btn-block ">No retired-hurt batter available</button>`
}
document.getElementById("retirHurt-batters").insertAdjacentHTML("beforeend", retirHurtPlayersHTML)
let battedIndexNumber
let retiredHurtPlayerName


//new batters adding functions

let addBattersButton=document.getElementsByClassName("newBatterToAdd")
let showBatterName=document.getElementById("selectedBatter")
let resetButton=document.getElementById("resetButton")
resetButton.disabled=true
//variables to store needed values
let newBatterName
let batterRegNumber
let batterIndex

//when playingEleven array list will filledup by 12 players.then this function will run.
function readyToSubmit(){
   for(let i=0;i<addBattersButton.length;i++){
    addBattersButton[i].disabled=true
  }
  document.getElementById("submitBatterButton").disabled=false
}
//after deletion an item this function will be called
function resetActivities(){
        for(let i=0;i<addBattersButton.length;i++){
          if(enteredBatters.includes(String(i))){
            addBattersButton[i].disabled=true
            addBattersButton[i].style.backgroundColor="red"
            addBattersButton[i].innerHTML="X(added)X"
          }else{
            addBattersButton[i].disabled=false
          }
        }
        resetButton.disabled=true
        showBatterName.innerHTML="Select Batter"
        document.getElementById("submitBatterButton").disabled=true
}

//EVENTS RELATED FUNCTIONALITIES
document.addEventListener("click", function(e) {
  //select player from registered players
  e.preventDefault()
  if (e.target.classList.contains("newBatterToAdd")) {
    batterRegNumber=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
    newBatterName=e.target.parentElement.parentElement.querySelector("button").value
    batterIndex=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
    console.log(batterIndex)
    if (confirm(`NEW BATTER is : ${newBatterName} `)) {
        resetButton.disabled=false
        showBatterName.innerHTML="Batter Name : "+newBatterName
        readyToSubmit() 
    }
  }

//for retired hurt batters to adding on batting again
  if (e.target.classList.contains("retiredHurtButton")) {
    retiredHurtPlayerName=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
    battedIndexNumber=e.target.parentElement.parentElement.querySelector("button").value
    console.log(battedIndexNumber)
    if (confirm(`Retired Hurt player "${retiredHurtPlayerName}" is going to bat again.Are you sure??`)) {
      document.getElementById("battedIndex").value=battedIndexNumber
      document.getElementById("retiredHurtPlayerForm").submit()
    }
  }
})

resetButton.addEventListener("click",function(){
  resetActivities()
})

//submittion of players list
document.getElementById("submitBatterButton").addEventListener("click", function(e) {
  document.getElementById("batterName").value=newBatterName
  document.getElementById("batterRegNumber").value=batterRegNumber
  document.getElementById("batterIndex").value=batterIndex
  document.getElementById("newBatterAddingForm").submit()
})
resetActivities()

