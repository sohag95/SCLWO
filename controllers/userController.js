const User=require('../models/User')
const tournamentCollection = require("../db").db().collection("Tournaments")
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")
const administrationCollection = require("../db").db().collection("administration")

const CommonFunctions = require('../models/CommonFunctions')

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
}

exports.test = function (req, res) {
  res.render('teamSelectTest')
}

exports.guestHome=async function(req,res){
  try {
    let roomData = await liveRoomCollection.find().sort({ priority: -1 }).toArray()
    let rooms=roomData.filter((room)=>{
      if(!room.matchFinished){
        return room
      }
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
      return data
    })
    res.render("guest-home",{rooms:rooms})
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

exports.singleRoomShortDetails = async function (req, res) {
  try {
    
    let roomData = await liveRoomCollection.findOne({ matchId: req.params.matchId })
    let data=roomData
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
    console.log("recent balls:",data.recentBalls)
    let runs = Number(data.liveScore.totalRuns)
      let crr = ((runs*6) / ((data.liveScore.totalOvers*6)+data.eachOver.ballNumber)).toFixed(2)
      data.crr = crr
      console.log("crr:",((data.liveScore.totalOvers*6)+data.eachOver.ballNumber))
    res.render("single-room-short-details",{room:data})
  } catch {
    res.render("404")
  }
}


exports.firstInningsDetails = async function (req, res) {
  try {
    let roomData = await liveRoomCollection.findOne({ matchId: req.params.matchId })
    let data=roomData
    let tossWonBy
    if(data.matchDetails.tossWonBy=="firstTeam"){
      tossWonBy=data.matchDetails.firstTeam
    }else{
      tossWonBy=data.matchDetails.secondTeam
    }
    data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
    data.batting=CommonFunctions.getBattingTeamName(data)
    data.password=undefined
    let runs = Number(data.liveScore.totalRuns)
    
      let crr = ((runs*6) / ((data.liveScore.totalOvers*6)+data.eachOver.ballNumber)).toFixed(2)
     
      data.crr = crr
      console.log("crr:",crr)
    res.render("firstInningsDetails",{room:data})
  } catch {
    res.render("404")
  }
}

exports.secondInningsDetails = async function (req, res) {
  try {
    let roomData = await liveRoomCollection.findOne({ matchId: req.params.matchId })
    let data=roomData
    let tossWonBy
    if(data.matchDetails.tossWonBy=="firstTeam"){
      tossWonBy=data.matchDetails.firstTeam
    }else{
      tossWonBy=data.matchDetails.secondTeam
    }
    data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
    data.batting=CommonFunctions.getBattingTeamName(data)
    data.password=undefined
    let runs = Number(data.liveScore.totalRuns)
    let crr = ((runs*6) / ((data.liveScore.totalOvers*6)+data.eachOver.ballNumber)).toFixed(2)
      data.crr = crr
      console.log("crr:",crr)
    res.render("secondInningsDetails",{room:data})
  } catch {
    res.render("404")
  }
}

exports.batsmanInningsDetails = async function (req, res) {
  try {
    let roomData = await liveRoomCollection.findOne({ matchId: req.params.matchId })
    let data=roomData
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

    console.log("Params : ",Number(req.params.index))
    console.log("batsman : ",batsman)
    
    res.render("batsmanInningsDetails",{batsman:batsman})
  } catch {
    res.render("404")
  }
}
