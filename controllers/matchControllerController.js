const MatchController=require('../models/MatchController')
const LiveScoreRoom=require('../models/LiveScoreRoom')
const MatchesLiveToCompleted = require('../models/MatchesLiveToCompleted')
const CommonFunctions = require('../models/CommonFunctions')
const SuccessMatchRoom = require('../models/SuccessMatchRoom')
const UpdatePlayerScore = require('../models/UpdatePlayerScore')
const tournamentCollection = require("../db").db().collection("Tournaments")
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")
const completedMatchesCollection = require("../db").db().collection("CompletedMatches")
 
exports.matchControllerHome=async function(req,res){
  try{
    let date=new Date()
    let tournaments=await tournamentCollection.find({tournamentYear:String(date.getFullYear()),isTournamentCompleted:false}).sort({ createdDate: -1 }).toArray()
    let rooms=await liveRoomCollection.find({matchFinished:true}).toArray()
    let successMatches=await completedMatchesCollection.find({scoreAdditionCompleted:false}).toArray()
    let completedMatches=rooms.map((room)=>{
      let data=room
      let tossWonBy
      if(data.matchDetails.tossWonBy=="firstTeam"){
        tossWonBy=data.matchDetails.firstTeam
      }else{
        tossWonBy=data.matchDetails.secondTeam
      }
      data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
      data.batting=CommonFunctions.getBattingTeamName(data)
      data.password=undefined
      return data
    })
    //all the matches where players score updation is not completed
    let successRooms=successMatches.map((room)=>{
      let data=room
      let tossWonBy
      if(data.matchDetails.tossWonBy=="firstTeam"){
        tossWonBy=data.matchDetails.firstTeam
      }else{
        tossWonBy=data.matchDetails.secondTeam
      }
      data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
      data.batting=CommonFunctions.getBattingTeamName(data)
      data.password=undefined
      return data
    })

    res.render('matchController-home',{
      regErrors: req.flash("regErrors"),
      tournaments:tournaments,
      completedMatches:completedMatches,
      successMatches:successRooms
    })
  }catch{
    res.render("404")
  }
}

exports.addGroupPage=async function(req,res){
    let groups=["A","B","C","D","E","F","G","H","I","J"]
    req.tournamentData.groups.forEach((group)=>{
      groups.shift(group.groupName)
    })
    req.tournamentData.addedGroups=groups
    res.render('add-tournament-group-teams',{
      tournamentData:req.tournamentData,
      regErrors: req.flash("regErrors")
    })
}

exports.availableMatchRooms=async function(req,res){
  try{
    let allRooms=await liveRoomCollection.find({"matchDetails.isStarted":false}).toArray()
    let roomsData=[]
    allRooms.forEach((room)=>{
      let data={
        _id:room._id,
        matchId:room.matchId,
        password:room.password,
        tournamentName: room.matchDetails.tournamentName,
        tournamentYear:room.matchDetails.tournamentYear,
        secondRoundName:room.matchDetails.secondRoundName,
        groupName:room.matchDetails.groupName,
        secondRoundName:room.matchDetails.secondRoundName,
        matchNumber: room.matchDetails.matchNumber,
        venue: room.matchDetails.venue,
        firstTeam: room.matchDetails.firstTeam,
        secondTeam: room.matchDetails.secondTeam,
        dateOfTheMatch:room.matchDetails.dateOfTheMatch,
        matchStartingTime: room.matchDetails.matchStartingTime,
      }
      roomsData.push(data)
    })
    res.render('all-available-match-rooms',{
      roomsData:roomsData
    })
  }catch{
    req.flash('errors', "Sorry there is some problem.Try again later!!")
    req.session.save(function() {
      res.redirect('/matchController-home')
    })
  }
}

exports.getSecondRoundTeamsPage=function(req,res){
  res.render('add-second-round-teams',{
    tournamentData:req.tournamentData,
    regErrors: req.flash("regErrors")
  })
}

exports.addSecondRoundTeams=function(req,res){
  let allQualifiedTeams=JSON.parse(req.body.allTeams)
  let tournamentData=req.tournamentData
  let qualifiedTeamData=[{
    groupName:"ALL",
    teams:[]
  }]
  allQualifiedTeams.forEach((team)=>{
    let groupIndex=Number(team.groupIndex)
    let teamIndex=Number(team.teamIndex)
    let teamData={
          teamFullName:tournamentData.groups[groupIndex].teams[teamIndex].teamFullName,
          teamShortName:tournamentData.groups[groupIndex].teams[teamIndex].teamShortName,
          matchesPlayed:0,
          matchesWin:0,
          matchesLoss:0,
          tieOrDraw:0,
          totalPoints:0,
          matches:[]
    }
    qualifiedTeamData[0].teams.push(teamData)
  })
 MatchController.addNextRoundQualifiedTeams(qualifiedTeamData,req.body.roundName,req.params._id).then(function () {
        let message="Qualified teams for next round successfully added."
        req.flash("success", message)
        req.session.save(() => res.redirect(`/tournament/qualified/${req.params._id}/second-round-teams`))
      }).catch(function () {
        req.flash("errors", "There is some problem")
        req.session.save(() => res.redirect(`/tournament/qualified/${req.params._id}/second-round-teams`))
      })
}

exports.matchControllerMustBeLoggedIn = function(req, res, next) {
  if (req.session.user.accountType=="matchController") {
    next()
  } else {
    req.flash("errors", "You must be logged in as match controller to perform that action.")
    req.session.save(function() {
      res.redirect('/')
    })
  }
}

exports.matchControllerLogin = function(req, res) {
  let matchController = new MatchController(req.body)
  matchController.matchControllerLogin().then(function(result) {
    req.session.user = {regNumber: matchController.data.regNumber, userName: matchController.data.userName,accountType:"matchController"}
    req.session.save(function() {
      res.redirect('/matchController-home')
    })
  }).catch(function(e) {
    req.flash('errors', e)
    req.session.save(function() {
      res.redirect('/')
    })
  })
}

exports.liveMatchRoomCreate =function (req, res) {
  try {
    let liveScoreRoom = new LiveScoreRoom(req.body)
    console.log("body", req.body)
    liveScoreRoom
      .createRoom()
      .then(function (matchId) {
        let message="Live Score Room Successfully created.Room id is : "+matchId+" and Room password is : "+req.body.password
        req.flash("success", message)
        req.session.save(() => res.redirect("/matchController-home"))
      })
      .catch(function (errors) {
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/matchController-home"))
      })
  } catch {
    res.render("404")
  }
}

exports.liveMatchRoomDelete =function (req, res) {
  try {
    
    LiveScoreRoom
      .deleteRoom(req.params._id)
      .then(function () {
        let message="Live Score Room Successfully deleted."
        req.flash("success", message)
        req.session.save(() => res.redirect("/all-available-match-rooms"))
      })
      .catch(function () {
         req.flash("errors", "Sorry there is some problem.Try again later!")
        req.session.save(() => res.redirect("/all-available-match-rooms"))
      })
  } catch {
    res.render("404")
  }
}

exports.addNewTournament =function (req, res) {
  try {
    let matchController = new MatchController(req.body)
    console.log("body", req.body)
    matchController
      .createTournament()
      .then(function (tournamentId) {
        console.log("tournament id:",tournamentId)
        let message="New tournament added.Add groups with team names."
        req.flash("success", message)
        req.session.save(() => res.redirect(`/tournament/${tournamentId}/add-group`))
      })
      .catch(function (errors) {
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/matchController-home"))
      })
  } catch {
    res.render("404")
  }
}

exports.ifTournamentExists = function(req, res, next) {
  MatchController.findSingleTournamentById(req.params._id).then(function(tournamentData) {
    req.tournamentData=tournamentData
    next()
  }).catch(function() {
    res.render("404")
  })
}

exports.deleteTournament=function(req,res){
  let tournamentName=req.body.tournamentName
  if(req.tournamentData.tournamentName==tournamentName){
    if(!req.tournamentData.isTournamentCompleted && !req.tournamentData.isSecondRoundStarted){
      MatchController.deleteTournament(req.params._id).then(()=>{
        req.flash("success", "Tournament successfully deleted.")
        req.session.save(() => res.redirect("/matchController-home"))
      }).catch(()=>{
        req.flash("errors", "There is some problem")
        req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
      })
    }else{
      req.flash("errors", "You can not delete this tournament.It is marked as completed or second round has started.")
      req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
    }
  }else{
    req.flash("errors", "You have written wrong tournament name!!")
    req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
  }
}

exports.tournamentCompleted=function(req,res){
  let checkWord=req.body.checkWord
  if(checkWord=="completed"){
      MatchController.tournamentCompleted(req.params._id).then(()=>{
        req.flash("success", "Successfully marked the tournament as COMPLETED !!.")
        req.session.save(() => res.redirect("/matchController-home"))
      }).catch(()=>{
        req.flash("errors", "There is some problem")
        req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
      })
  }else{
    req.flash("errors", "Please write 'completed' to mark the tournament as completed!!")
    req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
  }
}

exports.addFixtureLink=function(req,res){
  MatchController.addFixtureLink(req.body.fixtureLink,req.params._id).then(()=>{
    req.flash("success", "Tournament Fixture link successfully added.")
    req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
  })
}

exports.addSecondRoundFixtureLink=function(req,res){
  if(req.tournamentData.isSecondRoundStarted){
    MatchController.addSecondRoundFixtureLink(req.body.secondRoundFixtureLink,req.params._id).then(()=>{
      req.flash("success", "Tournament Fixture link for second round successfully added.")
      req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
    }).catch(()=>{
      req.flash("errors", "There is some problem")
      req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
    })
  }else{
    req.flash("errors", "Second round has not been started for this tournament!!")
    req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
  }
  
}

exports.ifMatchRoomExists = function(req, res, next) {
  LiveScoreRoom.findSingleRoomById(req.params._id).then(function(matchData) {
    req.matchData=matchData
    next()
  }).catch(function() {
    res.render("404")
  })
}


exports.addScoreCardLink=function(req,res){
  LiveScoreRoom.addScoreCardLink(req.body.scoreCardLink,req.params._id).then(()=>{
    req.flash("success", "Score card link successfully added.")
    req.session.save(() => res.redirect("/matchController-home"))
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    req.session.save(() => res.redirect("/matchController-home"))
  })
}

exports.addGroupOnTournament =function (req, res) {
  let allTeams=JSON.parse(req.body.allTeams)
  let groupName=req.body.groupName
  let teams={
    groupName:groupName,
    allTeams:allTeams
  }
  MatchController.addGroupsOnTournament(teams,req.params._id)
      .then(function () {
        let message="New group added.Add another group if needed."
        req.flash("success", message)
        req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
      })
      .catch(function () {
        req.flash("errors", "There is some problem")
        req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
      })
}

exports.allGroupsAdded =function (req, res) {
  MatchController.markingGroupsAdded(req.params._id)
      .then(function () {
        req.flash("success", "All groups added!!")
        req.session.save(() => res.redirect("/matchController-home"))
      })
      .catch(function () {
        req.flash("errors", "There is some problem")
        req.session.save(() => res.redirect(`/tournament/${req.params._id}/add-group`))
      })
}


exports.markSuccessfullyDone =function (req, res) {
 let matchesLiveToComplete=new MatchesLiveToCompleted(req.matchData)
 matchesLiveToComplete.successfullyDone()
      .then(function () {
        req.flash("success", "Successfully marked the match as ready to update players details.")
        req.session.save(() => res.redirect("/matchController-home"))
      })
      .catch(function () {
        req.flash("errors", "There is some problem")
        req.session.save(() => res.redirect("/matchController-home"))
      })
}

exports.ifSuccessMatchExists = function(req, res, next) {
  SuccessMatchRoom.findSingleRoomById(req.params.matchId).then(function(matchData) {
    req.successMatchData=matchData
    next()
  }).catch(function() {
    res.render("404")
  })
}
//in case of searching successfull match room by typing matchId.
exports.searchMatchId = function(req, res, next) {
  SuccessMatchRoom.findSingleRoomById(req.body.matchId).then(function(matchData) {
    req.successMatchData=matchData
    next()
  }).catch(function() {
    res.render("404")
  })
}

exports.getPlayersScoreUpdationPage = function(req, res) {
  let matchData=req.successMatchData
  let playersScoreDetails=CommonFunctions.getPlayersScoreDetailsOfAMatch(matchData)
  let enteredRegNumbers={
    enteredRegNumbersFirstTeam:matchData.firstTeamScoreEnteredRegNumbers,
    enteredRegNumbersSecondTeam:matchData.secondTeamScoreEnteredRegNumbers
  }
  let matchDetails={
    matchId:matchData.matchId,
    scoreAdditionCompleted:matchData.scoreAdditionCompleted,
    tournamentName:matchData.matchDetails.tournamentName,
    tournamentYear:matchData.matchDetails.tournamentYear,
    venue:matchData.matchDetails.venue,
    matchNumber:matchData.matchDetails.matchNumber,
    firstTeam:matchData.matchDetails.firstTeam,
    secondTeam:matchData.matchDetails.secondTeam,
    winningStatus:matchData.matchDetails.winningStatus,
  }
  res.render("success-match-all-players-score",{
    playersScoreDetails:playersScoreDetails,
    enteredRegNumbers:enteredRegNumbers,
    matchDetails:matchDetails
  })
}


exports.playerScoreUpdate = function(req, res) {
  console.log(req.body)
  let updatePlayerScore=new UpdatePlayerScore(req.body,req.successMatchData)
  updatePlayerScore.updateScore().then((result)=>{
    console.log(result)
    req.flash("success", "Successfully score updated.")
    req.session.save(() => res.redirect(`/players-scores/${req.params.matchId}/updation/link/page`))
  }).catch((errors)=>{
    errors.forEach(error => req.flash("errors", error))
    req.session.save(() => res.redirect(`/players-scores/${req.params.matchId}/updation/link/page`))
  })
}

exports.markAsAllPlayerDataAdded = function(req, res) {
  SuccessMatchRoom.markAsPlayersDataAdded(req.successMatchData._id).then(()=>{
    req.flash("success", "Successfully marked.")
    req.session.save(() => res.redirect("/matchController-home"))
  }).catch(()=>{
    req.flash("errors", "There is some problem.Please try again later!")
    req.session.save(() => res.redirect("/matchController-home"))
  })
}

exports.getCompletedMatches =async function (req, res) {
  try{
    let tournamentName=req.params.tournamentName
    let tournamentYear=req.params.tournamentYear
    let roomsData=await completedMatchesCollection.find({"matchDetails.tournamentName":tournamentName,"matchDetails.tournamentYear":tournamentYear}).toArray()
    let rooms=roomsData.map((room)=>{
    let data=room
    let tossWonBy
    if(data.matchDetails.tossWonBy=="firstTeam"){
      tossWonBy=data.matchDetails.firstTeam
    }else{
      tossWonBy=data.matchDetails.secondTeam
    }
    data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
    data.batting=CommonFunctions.getBattingTeamName(data)
    return data
  })
    res.render("all-completed-matches",{
      rooms:rooms
    })
  }catch{
    res.render("404")
  }
}