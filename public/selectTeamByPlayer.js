// let tournaments=[
//   {
//     tournamentName:"1st-division",
//     groups:[
//       {
//         groupName:"A",
//         teams:[
//           {
//             teamShortName:"SSC",
//             teamFullName:"Team short name"
//           },{
//             teamShortName:"MSC",
//             teamFullName:"Team short name"
//           },
//           {
//             teamShortName:"CCA",
//             teamFullName:"Team short name"
//           }
//         ]
//       },{
//         groupName:"B",
//         teams:[
//           {
//             teamShortName:"BJSC",
//             teamFullName:"Team short name"
//           },{
//             teamShortName:"UNC",
//             teamFullName:"Team short name"
//           },
//           {
//             teamShortName:"SUSC",
//             teamFullName:"Team short name"
//           }
//         ]
//       },
//     ]
//   },{
//     tournamentName:"super-division",
//     groups:[
//       {
//         groupName:"A",
//         teams:[
//           {
//             teamShortName:"JNU",
//             teamFullName:"JNU"
//           },{
//             teamShortName:"NBU",
//             teamFullName:"JNU"
//           },
//           {
//             teamShortName:"BHU",
//             teamFullName:"JNU"
//           }
//         ]
//       },{
//         groupName:"B",
//         teams:[
//           {
//             teamShortName:"HU",
//             teamFullName:"JNU"
//           },{
//             teamShortName:"MU",
//             teamFullName:"JNU"
//           },
//           {
//             teamShortName:"JU",
//             teamFullName:"JNU"
//           }
//         ]
//       }
//     ]
//   }
// ]
let tournaments=presentTournaments
let tournamentPart = document.getElementById("tournamentPart")
let playerTeamNamePart = document.getElementById("playerTeamNamePart")

let allTeamNames=[]


function getTournamentNames(){
  let allTournaments=[]
  tournaments.forEach((tournament)=>{
    allTournaments.push(tournament.tournamentName)
  })
  return allTournaments
}

function getTeamNames(selectedTournament){
  allTeamNames=[]
  tournaments.forEach((tournament)=>{
    if(tournament.tournamentName==selectedTournament){
      tournament.groups.forEach((group)=>{    
        group.teams.forEach((team)=>{
          let teamName={
            teamFullName:team.teamFullName,
            teamShortName:team.teamShortName
          }
          allTeamNames.push(teamName)
        }) 
      })
    }
  })
  return allTeamNames
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

tournamentPart.addEventListener("change", () => {
  let selectedTournament=tournamentPart.value
  playerTeamNamePart.innerHTML=""
  if(selectedTournament){
    console.log(selectedTournament)
    let allTeams=getTeamNames(selectedTournament)
    let tag=document.createElement("option")
    tag.value=""
    tag.innerHTML="--Select Your Club Name--"
    playerTeamNamePart.options.add(tag)
    allTeams.forEach((team)=>{
      let newOption=document.createElement("option")
      newOption.value=team.teamShortName
      newOption.innerHTML=team.teamFullName+" ("+team.teamShortName+")"
      playerTeamNamePart.options.add(newOption)
    })
  }
})
  