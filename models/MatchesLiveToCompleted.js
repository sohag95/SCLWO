const tournamentCollection = require("../db").db().collection("Tournaments")
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")
const completedMatchesCollection = require("../db").db().collection("CompletedMatches")
 
const ObjectId = require('mongodb').ObjectId

let MatchesLiveToCompleted = function (matchData) {
  this.room = matchData
  this.matchId=this.room.matchId
  this.winningStatus=this.room.matchDetails.winningStatus
  this.tournamentName=this.room.matchDetails.tournamentName
  this.tournamentYear=this.room.matchDetails.tournamentYear
  this.winningTeamName=this.room.matchDetails.winningTeam
  this.lossingTeamName=this.room.matchDetails.lossingTeam
  this.groupName=this.room.matchDetails.groupName
  this.groupIndex
  this.winningTeamIndex
  this.lossingTeamIndex
  this.winningTeamDetails
  this.lossingTeamDetails
  this.matchForWinningTeam
  this.matchForLossingTeam
  this.newRoomData
  this.secondRoundStarted=false
  this.matchDraw=this.room.matchDetails.isDraw
}

MatchesLiveToCompleted.prototype.getTournamentData= function(){
  return new Promise(async (resolve, reject) => {
    try {
  let tournamentData=await tournamentCollection.findOne(
    {
      tournamentYear:this.tournamentYear,
      tournamentName:this.tournamentName
    })
    let tournamentGroups
    if(tournamentData.isSecondRoundStarted){
      tournamentGroups=tournamentData.secondRoundGroups
      this.secondRoundStarted=true
    }else{
      tournamentGroups=tournamentData.groups
    }
    tournamentGroups.forEach((group,index1)=>{
      if(group.groupName==this.groupName){
         this.groupIndex=index1
      }
    })
    console.log(tournamentGroups)
    console.log(this.groupIndex)
    tournamentGroups[this.groupIndex].teams.forEach((team,index2)=>{
      if(this.winningTeamName==team.teamShortName){
         this.winningTeamIndex=index2
      }
      if(this.lossingTeamName==team.teamShortName){
        this.lossingTeamIndex=index2
      }
    })
    console.log("Group Index:",this.groupIndex)
    console.log("Winning team index:",this.winningTeamIndex)
    console.log("Lossing team index:",this.lossingTeamIndex)
    this.winningTeamDetails=tournamentGroups[this.groupIndex].teams[this.winningTeamIndex]
    this.lossingTeamDetails=tournamentGroups[this.groupIndex].teams[this.lossingTeamIndex]
    
    resolve()
  }catch{
    console.log("I am here buddy!!")
    reject()
  }
})
}

MatchesLiveToCompleted.prototype.calculateTeamData=function(){
 //winning team details update
   this.matchForWinningTeam={
    matchId:this.matchId,
    opponentTeam:this.lossingTeamName,
    winningStatus:this.winningStatus
  }
  //lossing team details update
  this.matchForLossingTeam={
    matchId:this.matchId,
    opponentTeam:this.winningTeamName,
    winningStatus:this.winningStatus
  }

  if(!this.matchDraw){
    this.winningTeamDetails.matchesPlayed=this.winningTeamDetails.matchesPlayed+1
    this.winningTeamDetails.matchesWin=this.winningTeamDetails.matchesWin+1
    this.winningTeamDetails.totalPoints=this.winningTeamDetails.totalPoints+2
    //lossing team details update
    this.lossingTeamDetails.matchesPlayed=this.lossingTeamDetails.matchesPlayed+1
    this.lossingTeamDetails.matchesLoss=this.lossingTeamDetails.matchesLoss+1
  }else{
    this.winningTeamDetails.matchesPlayed=this.winningTeamDetails.matchesPlayed+1
    this.winningTeamDetails.tieOrDraw=this.winningTeamDetails.tieOrDraw+1
    this.winningTeamDetails.totalPoints=this.winningTeamDetails.totalPoints+1
    //lossing team details update
    this.lossingTeamDetails.matchesPlayed=this.lossingTeamDetails.matchesPlayed+1
    this.lossingTeamDetails.tieOrDraw=this.lossingTeamDetails.tieOrDraw+1
    this.lossingTeamDetails.totalPoints=this.lossingTeamDetails.totalPoints+1
  }
 console.log("Winning team details:",this.winningTeamDetails)
 console.log("Lossing team details:",this.lossingTeamDetails)
}

MatchesLiveToCompleted.prototype.updateTeamDataOnDB=function(){
  return new Promise(async (resolve, reject) => {
    let winningTeamMatchesWinPlace
    let winningTeamTotalPointsPlace
    let winningTeamMatchesPlace
    let winningTeamMatchesPlayed
    let lossingTeamMatchesPlayedPlace
    let lossingTeamMatchesLossPlace
    let lossingTeamMatchesPlace
    let winningTeamTieOrDrawPlace
    let lossingTeamTieOrDrawPlace
    let lossingTeamTotalPointsPlace

    if(this.secondRoundStarted){
       winningTeamMatchesWinPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".matchesWin"
       winningTeamTotalPointsPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".totalPoints"
       winningTeamMatchesPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".matches"
       winningTeamMatchesPlayed="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".matchesPlayed"
       winningTeamTieOrDrawPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".tieOrDraw"
      
       lossingTeamMatchesPlayedPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".matchesPlayed"
       lossingTeamMatchesLossPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".matchesLoss"
       lossingTeamMatchesPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".matches"
       lossingTeamTieOrDrawPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".tieOrDraw"
       lossingTeamTotalPointsPlace="secondRoundGroups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".totalPoints"
    }else{
       winningTeamMatchesWinPlace="groups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".matchesWin"
       winningTeamTotalPointsPlace="groups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".totalPoints"
       winningTeamMatchesPlace="groups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".matches"
       winningTeamMatchesPlayed="groups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".matchesPlayed"
       winningTeamTieOrDrawPlace="groups."+String(this.groupIndex)+".teams."+String(this.winningTeamIndex)+".tieOrDraw"
      
       lossingTeamMatchesPlayedPlace="groups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".matchesPlayed"
       lossingTeamMatchesLossPlace="groups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".matchesLoss"
       lossingTeamMatchesPlace="groups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".matches"
       lossingTeamTieOrDrawPlace="groups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".tieOrDraw"
       lossingTeamTotalPointsPlace="groups."+String(this.groupIndex)+".teams."+String(this.lossingTeamIndex)+".totalPoints"
    }
    
    try {
      if(this.matchDraw){
        await tournamentCollection.findOneAndUpdate({tournamentYear:this.tournamentYear,tournamentName:this.tournamentName},
          {
            $set:{
                [winningTeamTieOrDrawPlace]:this.winningTeamDetails.tieOrDraw,
                [winningTeamTotalPointsPlace]:this.winningTeamDetails.totalPoints,
                [winningTeamMatchesPlayed]:this.winningTeamDetails.matchesPlayed,
                [lossingTeamMatchesPlayedPlace]:this.lossingTeamDetails.matchesPlayed,
                [lossingTeamTieOrDrawPlace]:this.lossingTeamDetails.tieOrDraw,
                [lossingTeamTotalPointsPlace]:this.lossingTeamDetails.totalPoints
                
            },
            $push:{
              [winningTeamMatchesPlace]:this.matchForWinningTeam,
              [lossingTeamMatchesPlace]:this.matchForLossingTeam
            }
          })

      }else{
        await tournamentCollection.findOneAndUpdate({tournamentYear:this.tournamentYear,tournamentName:this.tournamentName},
          {
            $set:{
                [winningTeamMatchesWinPlace]:this.winningTeamDetails.matchesWin,
                [winningTeamTotalPointsPlace]:this.winningTeamDetails.totalPoints,
                [winningTeamMatchesPlayed]:this.winningTeamDetails.matchesPlayed,
                [lossingTeamMatchesPlayedPlace]:this.lossingTeamDetails.matchesPlayed,
                [lossingTeamMatchesLossPlace]:this.lossingTeamDetails.matchesLoss
            },
            $push:{
              [winningTeamMatchesPlace]:this.matchForWinningTeam,
              [lossingTeamMatchesPlace]:this.matchForLossingTeam
            }
          })
      }
      resolve()
    }catch{
      reject()
    }
  })
}


MatchesLiveToCompleted.prototype.clearRoomData=function(){
  this.newRoomData={
    matchId:this.room.matchId,
    scoreAdditionCompleted:false,
    matchDetails:this.room.matchDetails,
    firstInningsScore:this.room.firstInningsScore,
    firstInningsExtras:this.room.firstInningsExtras,
    firstInningsBatting:this.room.firstInningsBatting,
    firstInningsBowling:this.room.firstInningsBowling,
    firstInningsFallOfWickets:this.room.firstInningsFallOfWickets,
    firstInningsBallTracking:this.room.firstInningsBallTracking,
    secondInningsScore:this.room.secondInningsScore,
    secondInningsExtras:this.room.secondInningsExtras,
    secondInningsBatting:this.room.secondInningsBatting,
    secondInningsBowling:this.room.secondInningsBowling,
    secondInningsFallOfWickets:this.room.secondInningsFallOfWickets,
    secondInningsBallTracking:this.room.secondInningsBallTracking,
    matchCancled:this.room.matchCancled,
    commentry:this.room.matchDetails.commentry,
    firstTeamScoreEnteredRegNumbers:[],
    secondTeamScoreEnteredRegNumbers:[],
    scoreCardLink:this.room.scoreCardLink
  }
  //this.newRoomData.matchDetails.commentry=this.room.matchDetails.commentry.slice(this.room.matchDetails.commentry.length-20,this.room.matchDetails.commentry.length)
  console.log("New room data:",this.newRoomData)
}


MatchesLiveToCompleted.prototype.successfullyDone=function(){
  return new Promise(async (resolve, reject) => {
    try {
      await this.getTournamentData()
      this.calculateTeamData()
      await this.updateTeamDataOnDB()
      this.clearRoomData()
      //here i have to remove live score room
      await liveRoomCollection.deleteOne({_id:new ObjectId(this.room._id)})
      await completedMatchesCollection.insertOne(this.newRoomData)
      resolve()
    }catch{
      reject()
    }
  })
}
module.exports=MatchesLiveToCompleted