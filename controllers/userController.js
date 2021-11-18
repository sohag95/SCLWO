const User=require('../models/User')
const tournamentCollection = require("../db").db().collection("Tournaments")
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")
const administrationCollection = require("../db").db().collection("administration")
const completedMatchesCollection = require("../db").db().collection("CompletedMatches")
 
const CommonFunctions = require('../models/CommonFunctions')
const Player = require('../models/Player')
const PerformanceTable = require('../models/PerformanceTable')
const PerformanceAnalysis = require('../models/PerformanceAnalysis')
const MatchController = require('../models/MatchController')
const Admin = require('../models/Admin')
const LiveScoreRoom = require('../models/LiveScoreRoom')



exports.test = function (req, res) {
  let performanceAnalysis=new PerformanceAnalysis()
  performanceAnalysis.arrangeData()
  res.render('teamSelectTest')
}

exports.logInForm = function (req, res) {
  if(!req.session.user){
    res.render("log-in-form")
  }else{
    req.flash("errors", "You already logged In !! Log-out first to fetch that page.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.loggingIn = function (req, res) {
  if(!req.session.user){
    let regNumber=req.body.regNumber
    if(regNumber.length==13){
      let userType=regNumber.slice(7,9)
      if(userType=="pl"){
        let player = new Player(req.body)
        player
          .playerLogin()
          .then(function (result) {
            req.session.user = { regNumber: player.data.regNumber, userName: player.data.userName,accountType: "player" }
            req.session.save(function () {
              res.redirect("/player-home")
            })
          })
          .catch(function (e) {
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect("/log-in")
            })
          })
      }else if(userType=="mc"){
        let matchController = new MatchController(req.body)
        matchController.matchControllerLogin().then(function(result) {
          req.session.user = {regNumber: matchController.data.regNumber, userName: matchController.data.userName,accountType:"matchController"}
          req.session.save(function() {
            res.redirect('/matchController-home')
          })
        }).catch(function(e) {
          req.flash('errors', e)
          req.session.save(function() {
            res.redirect('/log-in')
          })
        })
      }else if(userType=="ad"){
        let admin = new Admin(req.body)
        admin
          .adminLogin()
          .then(function (result) {
            console.log(result)
            req.session.user = { regNumber: admin.data.regNumber, userName: admin.data.userName, accountType: "admin" }
            req.session.save(function () {
              res.redirect("/admin-home")
            })
          })
          .catch(function (e) {
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect("/log-in")
            })
          })
      }else{
        req.flash("errors", "Invalid Registration Number/Password!!")
        req.session.save(() => res.redirect("/log-in"))
      }
    }else if(regNumber.length==11){
      let checkMatch=regNumber.slice(2,7)
      if(checkMatch=="match"){
        let scoreRoom = new LiveScoreRoom(req.body)
        scoreRoom
          .LiveScoreRoomControllerLogin()
          .then(function (result) {
            req.session.user = { matchId: scoreRoom.data.matchId, accountType: "liveScorer" }
            req.session.save(function () {
              res.redirect("/live-scorer-room")
            })
          })
          .catch(function (e) {
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect("/log-in")
            })
          })
      }else{
        req.flash("errors", "Invalid Match Id/Password!!")
        req.session.save(() => res.redirect("/log-in"))
      }
    }else{
      req.flash("errors", "Invalid Registration Number/Password!!")
      req.session.save(() => res.redirect("/log-in"))
    }
  }else{
    req.flash("errors", "You already logged In !! Log-out first to perform that action.")
    req.session.save(() => res.redirect("/log-in"))
  }
}


exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
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
    roomData.forEach((room)=>{
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
        //only match details part has been taken
        upCommingMatches.push(data.matchDetails)
      }
      return data
    })

    //#####################################
    //here i have to grabe all notices given by admin
    //#####################################
    //Top players getting
    let topPlayers = await administrationCollection.findOne({regNumber:"siliguriTop10Players"})
    let top5Players={
      topBatters:topPlayers.topBatters.slice(0,6),
      topBowlers:topPlayers.topBowlers.slice(0,6),
      topAllRounders:topPlayers.topAllRounders.slice(0,6)
    }
    console.log(top5Players)
    res.render("guest-home",{
      liveRooms:liveRooms,
      upCommingMatches:upCommingMatches,
      top5Players:top5Players
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

exports.singleTeam =async function (req, res) {
  try{
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
    let teamDetailsInfo={
      secondRoundStarted:tournamentData.isSecondRoundStarted,
      firstRoundTeamGroup:null,
      firstRoundTeamData:null,
      secondRoundTeamGroup:null,
      secondRoundTeamData:null,
    }

    let firstRoundTeamGroup=null
    let firstRoundTeamData=null
    let secondRoundTeamGroup=null
    let secondRoundTeamData=null

    if(round=="firstRound"){
      groupName=tournamentData.groups[groupIndex].groupName
      teamData=tournamentData.groups[groupIndex].teams[teamIndex]
      firstRoundTeamGroup=groupName
      firstRoundTeamData=teamData
      let teamName=teamData.teamFullName
      if(tournamentData.isSecondRoundStarted){
        tournamentData.secondRoundGroups[0].teams.forEach((team)=>{
          if(team.teamFullName==teamName){
            secondRoundTeamGroup=tournamentData.secondRoundGroups[0].groupName
            secondRoundTeamData=team
          }
        })
      }
    }
    if(round=="secondRound"){
      if(tournamentData.isSecondRoundStarted){
        groupName=tournamentData.secondRoundGroups[groupIndex].groupName
        teamData=tournamentData.secondRoundGroups[groupIndex].teams[teamIndex]
        secondRoundTeamGroup=groupName
        secondRoundTeamData=teamData
        let teamName2=teamData.teamFullName
        tournamentData.groups.forEach((group)=>{
          group.teams.forEach((team)=>{
            if(team.teamFullName==teamName2){
              firstRoundTeamGroup=group.groupName
              firstRoundTeamData=team
            }
          })
        }) 
      }
    }
    teamDetailsInfo={
      secondRoundStarted:tournamentData.isSecondRoundStarted,
      firstRoundTeamGroup:firstRoundTeamGroup,
      firstRoundTeamData:firstRoundTeamData,
      secondRoundTeamGroup:secondRoundTeamGroup,
      secondRoundTeamData:secondRoundTeamData,
    }
    console.log(teamDetailsInfo)
    //getting individual player performance details for a specific tournament
    let teamPlayers=null
    if(!tournamentData.isTournamentCompleted){
      let getPlayersPerformanceData=await Player.getTeamPlayersPerformances(tournamentData.tournamentName,tournamentData.tournamentYear,teamData.teamShortName)
      teamPlayers=CommonFunctions.getPlayersPerformanceInTournament(tournamentData.tournamentName,tournamentData.tournamentYear,getPlayersPerformanceData)
    }

    if(groupName && teamData){
      let teamDetails={
        tournamentData:tournament,
        teamData:teamDetailsInfo
      }
      res.render('single-team-details',{
        teamDetails:teamDetails,
        teamPlayers:teamPlayers
      })
    }else{
      res.render("404")
    }
  }catch{
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


