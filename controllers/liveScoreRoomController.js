const Calculation = require("../models/Calculation")
const CommonFunctions = require("../models/CommonFunctions")
const LiveScoreRoom = require("../models/LiveScoreRoom")
const Player = require("../models/Player")
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")


exports.liveScorerMustBeLoggedIn = function (req, res, next) {
  if (req.session.user.accountType == "liveScorer") {
    next()
  } else {
    req.flash("errors", "You must be logged in as a scorer to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}

exports.liveScorerRoom=async function(req,res){
  try{
    let roomData = await liveRoomCollection.findOne({ matchId: req.matchId })
    let data=roomData
    let tossWonBy
    if(data.matchDetails.tossWonBy){
      if(data.matchDetails.tossWonBy=="firstTeam"){
        tossWonBy=data.matchDetails.firstTeam
      }else{
        tossWonBy=data.matchDetails.secondTeam
      }
    }
    data.tossDetails=tossWonBy+" won the toss and decided to "+data.matchDetails.decidedTo+" first."
    data.batting=CommonFunctions.getBattingTeamName(data)
    let balls
    if(data.matchDetails.inningsStatus=="1st Innings"){
      balls=data.firstInningsBallTracking.balls
    }else{
      balls=data.secondInningsBallTracking.balls
    }
    data.recentBalls=balls.split(",")
    data.password=undefined
    let runs = Number(data.liveScore.totalRuns)
    let crr = ((runs*6) / ((data.liveScore.totalOvers*6)+data.eachOver.ballNumber)).toFixed(2)
      data.crr = crr

  //grabbing data to create team list
    let clubName=""
    let tournamentName=""
    let allPlayers=[]
    let teamListOf=""
    if(data.matchDetails.isStarted && (data.matchDetails.firstTeamTeamList.length==0 || data.matchDetails.secondTeamTeamList.length==0)){
      tournamentName=data.matchDetails.tournamentName
      if(data.matchDetails.firstTeamTeamList.length==0){
        clubName=data.matchDetails.firstTeam
        teamListOf="firstTeamTeamList"
      }else{
        clubName=data.matchDetails.secondTeam
        teamListOf="secondTeamTeamList"
      }
      //collecting all registered players name with registration number for the specific tournament and club name.
      allPlayers=await Player.getPlayersByTournamentAndClubName(clubName,tournamentName)
    }
    let createTeamList={
      teamListOf:teamListOf,
      clubName:clubName,
      allPlayers:allPlayers
    }
  //Batter list to add new batter
    let battersList=[]
    let battersIndexes=[]
    let newBattersList=[]
    if(data.matchDetails.isStarted && data.matchDetails.tossWonBy && (data.state.strikerIndex==null || data.state.nonStrikerIndex==null || data.state.wicketFallen)){
      if(data.matchDetails.tossWonBy=="firstTeam" && data.matchDetails.decidedTo=="batting" && data.matchDetails.inningsStatus=="1st Innings"){
        battersList=data.matchDetails.firstTeamTeamList
      }else if(data.matchDetails.tossWonBy=="firstTeam" && data.matchDetails.decidedTo=="bowling" && data.matchDetails.inningsStatus=="2nd Innings"){
        battersList=data.matchDetails.firstTeamTeamList
      }else if(data.matchDetails.tossWonBy=="secondTeam" && data.matchDetails.decidedTo=="bowling" && data.matchDetails.inningsStatus=="1st Innings"){
        battersList=data.matchDetails.firstTeamTeamList
      }else if(data.matchDetails.tossWonBy=="secondTeam" && data.matchDetails.decidedTo=="batting" && data.matchDetails.inningsStatus=="2nd Innings"){
        battersList=data.matchDetails.firstTeamTeamList
      }else{
        battersList=data.matchDetails.secondTeamTeamList
      }
      battersIndexes=data.matchDetails.battersIndexes
      for(let i=0;i<11;i++){
        batter={
          regNumber:battersList[i].regNumber,
          userName:battersList[i].userName,
          index:String(i)
        }
        newBattersList.push(batter)
      }
    }
    let newBatterData={
      battersList:newBattersList,
      battersIndexes:battersIndexes
    }
    //bowlersList to add bowlers
    let bowlersIndexes=[]
    let newBowlers=[]
    let previousBowlerIndex=""
    let activeBowlers=[]
    let bowlers
    let bowlersList=[]
    if(data.matchDetails.isStarted && data.matchDetails.tossWonBy && (data.state.bowlerNumber==0 || data.state.overFinished)){
      if(data.matchDetails.inningsStatus=="1st Innings"){
        bowlers=data.firstInningsBowling.allBowlers
      }else{
        bowlers=data.secondInningsBowling.allBowlers
      }
      for(let i=0;i<bowlers.length;i++){
        let bowlerData={
          userName:bowlers[i].name,
          regNumber:bowlers[i].regNumber,
          index:String(i)
        }
        activeBowlers.push(bowlerData)
      }
      previousBowlerIndex=data.state.previousBowlerIndex
      bowlersIndexes=data.matchDetails.bowlersIndexes
      if(data.matchDetails.tossWonBy=="firstTeam" && data.matchDetails.decidedTo=="batting" && data.matchDetails.inningsStatus=="1st Innings"){
        bowlersList=data.matchDetails.secondTeamTeamList
      }else if(data.matchDetails.tossWonBy=="firstTeam" && data.matchDetails.decidedTo=="bowling" && data.matchDetails.inningsStatus=="2nd Innings"){
        bowlersList=data.matchDetails.secondTeamTeamList
      }else if(data.matchDetails.tossWonBy=="secondTeam" && data.matchDetails.decidedTo=="bowling" && data.matchDetails.inningsStatus=="1st Innings"){
        bowlersList=data.matchDetails.secondTeamTeamList
      }else if(data.matchDetails.tossWonBy=="secondTeam" && data.matchDetails.decidedTo=="batting" && data.matchDetails.inningsStatus=="2nd Innings"){
        bowlersList=data.matchDetails.secondTeamTeamList
      }else{
        bowlersList=data.matchDetails.firstTeamTeamList
      }
      for(let i=0;i<11;i++){
      let bowler={
          regNumber:bowlersList[i].regNumber,
          userName:bowlersList[i].userName,
          index:String(i)
        }
        newBowlers.push(bowler)
      }
    }
    let newBowlerData={
      bowlersIndexes:bowlersIndexes,
      newBowlers:newBowlers,
      previousBowlerIndex:previousBowlerIndex,
      activeBowlers:activeBowlers
    }
    let retiredHurtPlayers=data.matchDetails.retiredHurtPlayers
    res.render("live-scorer-room",{
      room:data,
      createTeamList:createTeamList,
      newBatterData:newBatterData,
      newBowlerData:newBowlerData,
      retiredHurtPlayers:retiredHurtPlayers
    })
  } catch {
    res.render("404")
  }
}



//Live match scorer's activities.
exports.matchStarted = function (req, res) {
  LiveScoreRoom.matchStarted(req.body, req.matchId)
    .then(function () {
      req.flash("success", "Match started!! Please fill upthe following form to start scoring.")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.createTeamList = function (req, res) {
  let listedPlayers=JSON.parse(req.body.teamPlayers)
  let teamListOf=req.body.teamListOf
  let data={
    clubName:req.body.clubName,
    teamListOf:teamListOf,
    listedPlayers:listedPlayers
  }
  LiveScoreRoom.createTeamList(data,req.matchId)
    .then(function () {
      let msg
      if(data.teamListOf=="firstTeamTeamList"){
        msg="First team list created successfully.Create next team list."
      }else{
        msg="Second team list created successfully.Do next task..."
      }
      req.flash("success", msg)
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.startSecondInnings = function (req, res) {
  LiveScoreRoom.startSecondInnings(req.matchId)
    .then(function () {
      req.flash("success", "Second innings started!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.tossDetails = function (req, res) {
  LiveScoreRoom.tossDetails(req.body, req.matchId)
    .then(function () {
      req.flash("success", "Now you are ready to update score board.")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.matchCommentry = function (req, res) {
  LiveScoreRoom.matchCommentry(req.body, req.matchId)
    .then(function () {
      req.flash("success", "Comment successfully added!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.addBatsman = function (req, res) {
  LiveScoreRoom.addBatsman(req.body, req.matchId)
    .then(function () {
      req.flash("success", "Batsman successfully added!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.addNewBowler = function (req, res) {
  LiveScoreRoom.addNewBowler(req.body, req.matchId)
    .then(function () {
      req.flash("success", "New bowler successfully added!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.selectBowler = function (req, res) {
  LiveScoreRoom.selectBowler(req.body, req.matchId)
    .then(function () {
      req.flash("success", "Bowler successfully selected!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.updateScore = function (req, res) {
  let calculate=new Calculation(req.body)
  console.log("here",calculate.data)
  calculate.calculations(req.matchId)
    .then(function () {
      req.flash("success", "Score updated!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.runOut = function (req, res) {
  console.log("Body Data:",req.body)
  let calculate=new Calculation(req.body)
  calculate.afterRunOut(req.matchId)
    .then(function () {
      req.flash("success", "Score updated!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.generalOut = function (req, res) {
  let calculate=new Calculation(req.body)
  calculate.afterGeneralOut(req.matchId)
    .then(function () {
      req.flash("success", "Score updated!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.changeStrike = function (req, res) {
  let calculate=new Calculation(req.body)
  calculate.changeStrike(req.matchId)
    .then(function () {
      req.flash("success", "Strike changed!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.setManOfTheMatch = function (req, res) {
  LiveScoreRoom.manOfTheMatch(req.body, req.matchId)
    .then(function () {
      req.flash("success", "Game is over.Thank you.")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.addPaneltyRuns = function (req, res) {
  let calculate=new Calculation(req.body)
  calculate.addPaneltyRuns( req.matchId)
    .then(function () {
      req.flash("success", "Panelty runs added.")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.gotRetiredHurt = function (req, res) {
  Calculation.gotRetiredHurt(req.matchId)
    .then(function () {
      req.flash("success", "Add New Batter!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.addRetiredHurtBatterToBat = function (req, res) {
    console.log(req.body)
    Calculation.addRetiredHurtBatterToBat(req.matchId,req.body.battedIndex)
    .then(function () {
      req.flash("success", "Batter added successfully!!")
      req.session.save(function () {
        res.redirect("/live-scorer-room")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.addEmergencyMessage = function (req, res) {
  console.log(req.body)
  LiveScoreRoom.addEmergencyMessage(req.matchId,req.body.emergencyMessage)
  .then(function () {
    req.flash("success", "Emergency Message added!!")
    req.session.save(function () {
      res.redirect("/live-scorer-room")
    })
  })
  .catch(function (e) {
    req.flash("errors", e)
    req.session.save(function () {
      res.redirect("/")
    })
  })
}
exports.removeEmergencyMessage = function (req, res) {
  LiveScoreRoom.removeEmergencyMessage(req.matchId)
  .then(function () {
    req.flash("success", "Emergency Message removed!!")
    req.session.save(function () {
      res.redirect("/live-scorer-room")
    })
  })
  .catch(function (e) {
    req.flash("errors", e)
    req.session.save(function () {
      res.redirect("/")
    })
  })
}

exports.matchCancled = function (req, res) {
  LiveScoreRoom.matchCancled(req.matchId,req.body.canclationMessage)
  .then(function () {
    req.flash("success", "Match cancled!!")
    req.session.save(function () {
      res.redirect("/live-scorer-room")
    })
  })
  .catch(function (e) {
    req.flash("errors", e)
    req.session.save(function () {
      res.redirect("/")
    })
  })
}