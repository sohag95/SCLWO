let qualifiedTeamsData=[]

function addTeam(team) {
    
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Team name : </strong>${team.teamFullName}</span>
  <div>
  <button data-id="${team.groupIndex}" value="${team.teamIndex}" id="${team.teamFullName}" class="remove-team btn btn-danger btn-sm">Remove</button>
  </div>
  </li>`
}
let submitButton=document.getElementById("submitQualifiedTeamsButton")

function checkSubmitButton(){
  if(qualifiedTeamsData.length){
    submitButton.disabled=false
    submitButton.style.backgroundColor="#1e7e34"
    submitButton.innerHTML="Submit Qualified Teams"
  }else{
    submitButton.disabled=true
    submitButton.style.backgroundColor="#dc3545"
    submitButton.innerHTML="Select Qualified Teams"
  }
}
checkSubmitButton()
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("qualifiedButton")) {
    e.preventDefault()
    let groupIndex=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
    let teamIndex=e.target.parentElement.parentElement.querySelector("button").value
    let teamFullName=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
    e.target.parentElement.parentElement.querySelector("button").disabled=true
    e.target.parentElement.parentElement.querySelector("button").innerHTML="QUALIFIED"
    e.target.parentElement.parentElement.querySelector("button").style.backgroundColor="#1e7e34"
    let teamData={
      teamFullName:teamFullName,
      groupIndex:groupIndex,
      teamIndex:teamIndex
    }
    qualifiedTeamsData.push(teamData)
    document.getElementById("addedQualifiedTeams").insertAdjacentHTML("beforeend", addTeam(teamData))
    console.log(qualifiedTeamsData)
    checkSubmitButton()
  }

  if (e.target.classList.contains("remove-team")) {
    e.preventDefault()
    let teamFullName=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
    e.target.parentElement.parentElement.remove()
    qualifiedTeamsData=qualifiedTeamsData.filter((team)=>{
      if(team.teamFullName!=teamFullName){
        return team
      }
    })
    document.getElementById(teamFullName).disabled=false
    document.getElementById(teamFullName).style.backgroundColor="#dc3545"
    document.getElementById(teamFullName).innerHTML="Click If Qualified"
    console.log(qualifiedTeamsData)
    checkSubmitButton()
  }
})

//submitting all the qualified teams for next session for the tournament
let allQualifiedTeams=document.getElementById("allQualifiedTeams")
submitButton.addEventListener("click",function(e){
  e.preventDefault()
  if (confirm(`Total qualified teams are : ${qualifiedTeamsData.length}.Are you sure about those teams?`)) {
    allQualifiedTeams.value=JSON.stringify(qualifiedTeamsData)
    document.getElementById("addQualifiedTeamsForm").submit()
  }
})

