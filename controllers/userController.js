const User=require('../models/User')
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")
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
