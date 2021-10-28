

let tournaments=allTournaments
let tournamentPart = document.getElementById("tournamentPart")
let groupPart = document.getElementById("groupPart")
let firstTeamPart = document.getElementById("firstTeamPart")
let secondTeamPart = document.getElementById("secondTeamPart")
let secondRoundName=document.getElementById("secondRoundName")
let allTeamNames=[]

function getTournamentNames(){
  let allTournaments=[]
  tournaments.forEach((tournament)=>{
    allTournaments.push(tournament.tournamentName)
  })
  return allTournaments
}

function getGroupNames(selectedTournament){
  secondRoundName.value=""
  let allGroupNames=[]
  tournaments.forEach((tournament)=>{
    if(tournament.tournamentName==selectedTournament){
      let tournamentGroups
      if(tournament.isSecondRoundStarted){
        secondRoundName.value=tournament.secondRoundName
        tournamentGroups=tournament.secondRoundGroups
      }else{
        tournamentGroups=tournament.groups
      }
      tournamentGroups.forEach((group)=>{
        allGroupNames.push(group.groupName)
      })
    }
  })
  return allGroupNames
}

function getTeamNames(selectedTournament,selectedGroup){
  allTeamNames=[]
  tournaments.forEach((tournament)=>{
    if(tournament.tournamentName==selectedTournament){
      let tournamentGroups
      if(tournament.isSecondRoundStarted){
        tournamentGroups=tournament.secondRoundGroups
      }else{
        tournamentGroups=tournament.groups
      }
      tournamentGroups.forEach((group)=>{
        if(group.groupName==selectedGroup){
          group.teams.forEach((team)=>{
            let teamName={
              teamFullName:team.teamFullName,
              teamShortName:team.teamShortName
            }
            allTeamNames.push(teamName)
          })
        }
      })
    }
  })
  return allTeamNames
}

function getSecondTeamNames(selectedFirstTeam){
  return allTeamNames.filter((teamName)=>{
    if(teamName.teamShortName!=selectedFirstTeam){
      return teamName
    }
  })
}

function setTournamentName(){
  let presentTournaments=getTournamentNames()
  let tag=document.createElement("option")
  tag.value=""
  tag.innerHTML="--Select Tournament Name--"
  tournamentPart.options.add(tag)
  presentTournaments.forEach((tournament)=>{
    let newOption=document.createElement("option")
    newOption.value=tournament
    newOption.innerHTML=tournament
    tournamentPart.options.add(newOption)
  })
}
setTournamentName()

//when tournament will be set,group options will appear
tournamentPart.addEventListener("change", () => {
  let selectedTournament=tournamentPart.value
  groupPart.innerHTML=""
  firstTeamPart.innerHTML=""
  secondTeamPart.innerHTML=""
  if(selectedTournament){
    console.log(selectedTournament)
    let allGroups=getGroupNames(selectedTournament)
    let tag=document.createElement("option")
    tag.value=""
    tag.innerHTML="--Select Group Name--"
    groupPart.options.add(tag)
    allGroups.forEach((group)=>{
      let newOption=document.createElement("option")
      newOption.value=group
      newOption.innerHTML=group
      groupPart.options.add(newOption)
    })
  }
})
  
groupPart.addEventListener("change", () => {
  let selectedTournament=tournamentPart.value
  let selectedGroup=groupPart.value
  firstTeamPart.innerHTML=""
  secondTeamPart.innerHTML=""
  if(selectedGroup && selectedTournament){
    let firstTeams=getTeamNames(selectedTournament,selectedGroup)
    let tag=document.createElement("option")
    tag.value=""
    tag.innerHTML="--Select First Team Name--"
    firstTeamPart.options.add(tag)
    firstTeams.forEach((team)=>{
      let newOption=document.createElement("option")
      newOption.value=team.teamShortName
      newOption.innerHTML=team.teamFullName+" ("+team.teamShortName+")"
      firstTeamPart.options.add(newOption)
    })
  }
})

firstTeamPart.addEventListener("change", () => {
  let selectedFirstTeam=firstTeamPart.value
  secondTeamPart.innerHTML=""
  if(selectedFirstTeam){
    let secondTeams=getSecondTeamNames(selectedFirstTeam)
    let tag=document.createElement("option")
    tag.value=""
    tag.innerHTML="--Select First Team Name--"
    secondTeamPart.options.add(tag)
    secondTeams.forEach((team)=>{
      let newOption=document.createElement("option")
      newOption.value=team.teamShortName
      newOption.innerHTML=team.teamFullName+" ("+team.teamShortName+")"
      secondTeamPart.options.add(newOption)
    })
  }
})