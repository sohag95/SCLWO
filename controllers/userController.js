const User=require('../models/User')
const tournamentCollection = require("../db").db().collection("Tournaments")
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")
const administrationCollection = require("../db").db().collection("administration")
const completedMatchesCollection = require("../db").db().collection("CompletedMatches")
 
const CommonFunctions = require('../models/CommonFunctions')
const Player = require('../models/Player')
const PerformanceTable = require('../models/PerformanceTable')
const PerformanceAnalysis = require('../models/PerformanceAnalysis')

exports.logInForm = function (req, res) {
  if(!req.session.user){
    res.render("log-in-form")
  }else{
    req.flash("errors", "You already logged In !! Log-out first to fetch that page.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
}

exports.test = function (req, res) {
  let performanceAnalysis=new PerformanceAnalysis()
  performanceAnalysis.arrangeData()
  res.render('teamSelectTest')
}

exports.searchPlayer = function (req, res) {
  let searchTerm=req.body.searchTerm.toLowerCase()
  User.search(searchTerm)
    .then(players => {
      res.json(players)
    })
    .catch(() => {
      res.json([])
    })
}

exports.guestHome=async function(req,res){
  try {
    let liveRooms=[]
    let upCommingMatches=[]
    let roomData = await liveRoomCollection.find().sort({ priority: -1 }).toArray()
    let rooms=roomData.filter((room)=>{
        return room
    }).map((room)=>{
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
      if(data.matchDetails.isStarted){
        liveRooms.push(data)
      }
      if(!data.matchDetails.isStarted && upCommingMatches.length<=2){
        upCommingMatches.push(data)
      }
      return data
    })
    res.render("guest-home",{
      rooms:rooms,
      liveRooms:liveRooms,
      upCommingMatches:upCommingMatches
    })
  } catch {
    res.render("404")
  }
}

exports.tournaments =async function (req, res) {
  try{
    let tournaments=await tournamentCollection.find().toArray()
    let activeTournaments=[]
    let oldTournaments=[]
    tournaments.forEach((tournament)=>{
      if(!tournament.isTournamentCompleted){
        activeTournaments.push(tournament)
      }else{
        oldTournaments.push(tournament)
      }
    })
    res.render('tournaments',{
      activeTournaments:activeTournaments,
      oldTournaments : oldTournaments
    })
  }catch{
    res.render("404")
  }
}

exports.singleTournament = function (req, res) {
  res.render('single-tournament-details',{
    tournamentData:req.tournamentData
  })
}

exports.singleTeam = function (req, res) {
  let tournamentData=req.tournamentData
  let groupIndex=Number(req.params.groupIndex)
  let teamIndex=Number(req.params.teamIndex)
  let round=req.params.round
  let groupName
  let teamData
  let tournament={
    tournamentName:tournamentData.tournamentName,
    tournamentYear:tournamentData.tournamentYear
  }
  if(round=="firstRound"){
    groupName=tournamentData.groups[groupIndex].groupName
    teamData=tournamentData.groups[groupIndex].teams[teamIndex]
  }
  if(round=="secondRound"){
    groupName=tournamentData.secondRoundGroups[groupIndex].groupName
    teamData=tournamentData.secondRoundGroups[groupIndex].teams[teamIndex]
  }
  if(groupName && teamData){
    let teamDetails={
      tournamentData:tournament,
      groupName:groupName,
      team:teamData
    }
    res.render('single-team-details',{
      teamDetails:teamDetails
    })
  }else{
    res.render("404")
  }
}

exports.matches =async function (req, res) {
  try {
    let roomData = await liveRoomCollection.find().sort({ priority: -1 }).toArray()
    let rooms=roomData.map((room)=>{
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
    res.render('matches',{
      rooms:rooms
    })
  } catch {
    res.render("404")
  }
}

exports.topPlayers =async function (req, res) {
  try {
    let topPlayers = await administrationCollection.findOne({regNumber:"siliguriTop10Players"})
    let top10Players={
      topBatters:topPlayers.topBatters,
      topBowlers:topPlayers.topBowlers,
      topAllRounders:topPlayers.topAllRounders
    }
    res.render('top-10-players',{
      top10Players:top10Players
    })
  } catch {
    res.render("404")
  }
}


//scoreboard related routers

exports.ifMatchExists = async function (req, res,next) {
  try {
    let roomData = await liveRoomCollection.findOne({ matchId: req.params.matchId })
    let from="live"
    if(!roomData){
      roomData = await completedMatchesCollection.findOne({ matchId: req.params.matchId })
      from="completed"
    }
    if(roomData){
      req.roomData=roomData
      req.from=from
      next()
    }else{
      res.render("404")
    }
  } catch {
    res.render("404")
  }
}

exports.singleRoomShortDetails = async function (req, res) {
  try {
    let data=req.roomData
    let tossWonBy
    if(data.matchDetails.tossWonBy=="firstTeam"){
      tossWonBy=data.matchDetails.firstTeam
    }else{
      tossWonBy=data.matchDetails.secondTeam
    }
    data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
    data.batting=CommonFunctions.getBattingTeamName(data)
    data.password=undefined
    let balls
    if(data.matchDetails.inningsStatus=="1st Innings"){
      balls=data.firstInningsBallTracking.balls
    }else{
      balls=data.secondInningsBallTracking.balls
    }
    data.recentBalls=balls.split(",")
    if(req.from=="live"){
      let runs = Number(data.liveScore.totalRuns)
      let crr = ((runs*6) / ((data.liveScore.totalOvers*6)+data.eachOver.ballNumber)).toFixed(2)
      data.crr = crr
    }
    res.render("single-room-short-details",{
      room:data
    })
  } catch {
    res.render("404")
  }
}


exports.firstInningsDetails = async function (req, res) {
  try {
    let data=req.roomData
    let tossWonBy
    if(data.matchDetails.tossWonBy=="firstTeam"){
      tossWonBy=data.matchDetails.firstTeam
    }else{
      tossWonBy=data.matchDetails.secondTeam
    }
    data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
    data.batting=CommonFunctions.getBattingTeamName(data)
    data.password=undefined
    if(req.from=="live"){
      let runs = Number(data.liveScore.totalRuns)
      let crr = ((runs*6) / ((data.liveScore.totalOvers*6)+data.eachOver.ballNumber)).toFixed(2)
      data.crr = crr
    }
    if(req.from=="completed"){
      data.state={}
      data.eachOver={}
      data.state.bowlerIndex=0
      data.eachOver.ballNumber=0
    }
    res.render("firstInningsDetails",{room:data})
  } catch {
    res.render("404")
  }
}

exports.secondInningsDetails = async function (req, res) {
  try {
    let data=req.roomData
    let tossWonBy
    if(data.matchDetails.tossWonBy=="firstTeam"){
      tossWonBy=data.matchDetails.firstTeam
    }else{
      tossWonBy=data.matchDetails.secondTeam
    }
    data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
    data.batting=CommonFunctions.getBattingTeamName(data)
    data.password=undefined
    if(req.from=="live"){
      let runs = Number(data.liveScore.totalRuns)
      let crr = ((runs*6) / ((data.liveScore.totalOvers*6)+data.eachOver.ballNumber)).toFixed(2)
      data.crr = crr
    }
    if(req.from=="completed"){
      data.state={}
      data.eachOver={}
      data.state.bowlerIndex=0
      data.eachOver.ballNumber=0
    }
    res.render("secondInningsDetails",{
      room:data
    })
  } catch {
    res.render("404")
  }
}

exports.batsmanInningsDetails = async function (req, res) {
  try {
    let data=req.roomData
    let firstBattingTeam
    let secondBattingTeam
    if((data.matchDetails.tossWonBy=="firstTeam" && data.matchDetails.decidedTo=="batting") || (data.matchDetails.tossWonBy=="secondTeam" && data.matchDetails.decidedTo=="bowling")){
      firstBattingTeam=data.matchDetails.firstTeam
      secondBattingTeam=data.matchDetails.secondTeam
    }else if((data.matchDetails.tossWonBy=="firstTeam" && data.matchDetails.decidedTo=="bowling") || (data.matchDetails.tossWonBy=="secondTeam" && data.matchDetails.decidedTo=="batting")){
      firstBattingTeam=data.matchDetails.secondTeam
      secondBattingTeam=data.matchDetails.firstTeam
    }
    let batsman={}
    if(req.params.innings=="first"){
      batsman.teamName=firstBattingTeam
      batsman.score=data.firstInningsBatting.allBatsman[Number(req.params.index)]
    }
    if(req.params.innings=="second"){
      batsman.teamName=secondBattingTeam
      batsman.score=data.secondInningsBatting.allBatsman[Number(req.params.index)]
    }    
    res.render("batsmanInningsDetails",{
      batsman:batsman
    })
  } catch {
    res.render("404")
  }
}

exports.checkVisitorLoggedInOrNot = function (req, res, next) {
  let loggedIn=false
  if(req.session.user){
    if (req.session.user.accountType == "player") {
      loggedIn=true
    } 
  }
  req.loggedIn=loggedIn
  next()
}

exports.checkPlayerExistsOrNot = function (req, res, next) {
  Player.findPlayerByregNumber(req.params.regNumber).then(async(profileUserData)=>{
    let performanceData=await PerformanceTable.getPlayerPerformanceData(profileUserData.regNumber,"profile")
    req.profileUserData=profileUserData
    req.performanceData=performanceData
    next()
  }).catch(()=>{
    res.render("404")
  })
}

exports.getProfileData = function (req, res, next) {
  let isVisitorOwner=false
  if(req.loggedIn && (req.profileUserData.regNumber==req.session.user.regNumber)){
    isVisitorOwner=true
  }
  let checkData={
    isUserLoggedIn:req.loggedIn,
    isVisitorOwner:isVisitorOwner
  }
  res.render("profile-page",{
    profileUserData:req.profileUserData,
    performanceData:req.performanceData,
    checkData:checkData
  })
}


