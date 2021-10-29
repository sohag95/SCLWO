const administrationCollection = require("../db").db().collection("administration")
const tournamentCollection = require("../db").db().collection("Tournaments")
const ObjectId = require('mongodb').ObjectId

let MatchController = function (data) {
  this.data = data
  this.errors=[]
}

MatchController.prototype.matchControllerLogin = function () {
  return new Promise((resolve, reject) => {
    try {
      administrationCollection
        .findOne({ regNumber: this.data.regNumber })
        .then(attemptedUser => {
          if (attemptedUser && (this.data.password===attemptedUser.password)) {
            console.log("Executed!!")
            this.data = attemptedUser
            resolve("Congrats!")
          } else {
            reject("Invalid registration number / password.")
          }
        })
        .catch(function () {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}

MatchController.addGroupsOnTournament = function(teams,id) {
  return new Promise(async(resolve, reject)=> {
    try{
      let groupTeams=teams.allTeams.map((team)=>{
        let details={
          teamFullName:team.teamFullName,
          teamShortName:team.teamShortName.toUpperCase(),
          matchesPlayed:0,
          matchesWin:0,
          matchesLoss:0,
          tieOrDraw:0,
          totalPoints:0,
          matches:[]
        }  
        return details   
      })
      let groupDetails={
        groupName:teams.groupName,
        teams:groupTeams
      }
      console.log(groupDetails)
      await tournamentCollection.findOneAndUpdate(
        {_id:new ObjectId(id)},
        {$push:{
          "groups":groupDetails
        }}
      )
      resolve()
    }catch{
      reject()
    } 
  })
}

MatchController.prototype.createTournament = function () {
  return new Promise((resolve, reject) => {
    try {
      if (typeof this.data.tournamentName != "string") {
        this.data.tournamentName = ""
      }
      if (this.data.tournamentName == "") {
        this.errors.push("You must provide tournament name.")
      }
      if(!this.errors.length){
        let date=new Date()
        let details={
          tournamentYear:String(date.getFullYear()),
          tournamentName:this.data.tournamentName,
          isAddedAllGroups:false,
          groups:[],
          fixtureLink:null,
          isSecondRoundStarted:false,
          secondRoundName:null,
          secondRoundGroups:[],
          secondRoundFixtureLink:null,
          createdDate:date,
          isTournamentCompleted:false
        }
        tournamentCollection.insertOne(details).then((info)=>{
          resolve(info.insertedId)
        }).catch(()=>{
          reject(["There is some problem."])
        })
      }else{
        reject(this.errors)
      }
    } catch {
      reject(["Ther is some problem."])
    }
  })
}

MatchController.deleteTournament = function(id) {
  return new Promise(async function(resolve, reject) {
    try{
      await tournamentCollection.deleteOne({_id: new ObjectId(id)})
      resolve()
    }catch{
      reject()
    }
  })
}


MatchController.tournamentCompleted = function(id) {
  return new Promise(async function(resolve, reject) {
    try{
      await tournamentCollection.findOneAndUpdate({_id: new ObjectId(id)},{
        $set:{
          "isTournamentCompleted":true
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
}

MatchController.markingGroupsAdded = function(id) {
  return new Promise(async function(resolve, reject) {
    try{
      if (typeof(id) != "string" || !ObjectId.isValid(id)) {
        reject()
        return
      }
      await tournamentCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {
          $set:{
            "isAddedAllGroups":true
          }
        })
      resolve()
    }catch{
      reject()
    }
  })
}

MatchController.findSingleTournamentById = function(id) {
  return new Promise(async function(resolve, reject) {
    if (typeof(id) != "string" || !ObjectId.isValid(id)) {
      reject()
      return
    }
    let tournament = await tournamentCollection.findOne({_id: new ObjectId(id)})
    if (tournament) {
      resolve(tournament)
    } else {
      reject()
    }
  })
}

MatchController.addFixtureLink = function(fixtureLink,id) {
  return new Promise(async (resolve, reject)=> {
    try{
      await tournamentCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {
          $set:{
            "fixtureLink":fixtureLink
          }
        })
     resolve()
    }catch{
      reject()
    }
   
  })
}

MatchController.addSecondRoundFixtureLink = function(fixtureLink,id) {
  return new Promise(async (resolve, reject)=> {
    try{
      await tournamentCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {
          $set:{
            "secondRoundFixtureLink":fixtureLink
          }
        })
     resolve()
    }catch{
      reject()
    }
   
  })
}


MatchController.addNextRoundQualifiedTeams = function(qualifiedTeamData,roundName,id) {
  return new Promise(async(resolve, reject)=> {
    try{
      await tournamentCollection.findOneAndUpdate(
        {_id:new ObjectId(id)},
        {$set:{
          "isSecondRoundStarted":true,
          "secondRoundName":roundName,
          "secondRoundGroups":qualifiedTeamData
        }}
      )
      resolve()
    }catch{
      reject()
    } 
  })
}
module.exports = MatchController