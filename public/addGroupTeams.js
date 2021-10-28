let allGroupTeams=[]

function addTeam(team) {
    
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Name : </strong>${team.teamFullName}(${team.teamShortName})</span>
  <div>
  <button data-id="${team.teamFullName}" value="${team.teamShortName}" class="delete-team btn btn-danger btn-sm">Delete</button>
  </div>
  </li>`
}
let teamFullName = document.getElementById("teamFullName")
let teamShortName = document.getElementById("teamShortName")
let submitGroupsButton = document.getElementById("submitGroupsButton")
submitGroupsButton.disabled=true

//this part of code can be changed
let allGroupsAdded = document.getElementById("allGroupsAdded")
allGroupsAdded.addEventListener("click",(e)=>{
  e.preventDefault
  if (confirm(`Do you really want to mark the tournament as all groups added?`)) {
    document.getElementById("markAsAdded").submit()
  }
})

document.getElementById("create-team-form").addEventListener("submit", function(e) {
  e.preventDefault()
    // Create the HTML for a new team
    if(teamFullName.value && teamShortName.value){
      let team={
        teamFullName:teamFullName.value,
        teamShortName:teamShortName.value
      }
      document.getElementById("addedTeams").insertAdjacentHTML("beforeend", addTeam(team))
      allGroupTeams.push(team)
      teamFullName.value = ""
      teamShortName.value= ""
      teamFullName.focus()
      if(allGroupTeams.length>=2){
        submitGroupsButton.disabled=false
      }
    }
})


document.addEventListener("click", function(e) {
  if (e.target.classList.contains("delete-team")) {
    e.preventDefault()
    let teamFullName=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
    let teamShortName=e.target.parentElement.parentElement.querySelector("button").value
    if (confirm(`Do you really want to remove ${teamFullName} from this group?`)) {
        let theTeam={
          teamFullName:teamFullName,
          teamShortName:teamShortName
        }
        //removing selected team from allGroupTeams array list
        allGroupTeams=allGroupTeams.filter((team)=>{
          if(team.teamFullName!=theTeam.teamFullName){
            return team
          }
        })
        e.target.parentElement.parentElement.remove()
        if(allGroupTeams.length<2){
          submitGroupsButton.disabled=true
        }
    }
  }
})

document.getElementById("submitGroupsButton").addEventListener("click", function(e) {
  e.preventDefault()
  let totalTeam=allGroupTeams.length
  if (confirm(`Are you sure to submit those (${totalTeam}) teams on this group?`)) {
    let teams=JSON.stringify(allGroupTeams);
    document.getElementById("allTeams").value=teams
    console.log(allGroupTeams)
    document.getElementById("addGroupsOnTournament").submit()
  }
})