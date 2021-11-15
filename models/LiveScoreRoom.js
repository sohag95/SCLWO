const administrationCollection = require("../db").db().collection("administration")
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")
const MatchId = require("./MatchId")
const ObjectId = require('mongodb').ObjectId

let LiveScoreRoom = function (data) {
  this.data = data
  this.errors = []
}

LiveScoreRoom.prototype.cleanUp = async function () {
  try {
    console.log("in clean up....")
    this.matchId = await MatchId.getMatchId()
    console.log("match id:", this.matchId)
    
    if (typeof this.data.tournamentName != "string") {
      this.data.tournamentName = ""
    }
    if (typeof this.data.tournamentYear != "string") {
      this.data.tournamentYear = ""
    }
    if (typeof this.data.groupName != "string") {
      this.data.groupName = ""
    }
    if (typeof this.data.matchNumber != "string") {
      this.data.matchNumber = ""
    }
    if (typeof this.data.venue != "string") {
      this.data.venue = ""
    }
    if (typeof this.data.firstTeam != "string") {
      this.data.firstTeam = ""
    }
    if (typeof this.data.secondTeam != "string") {
      this.data.secondTeam = ""
    }
    if (typeof this.data.date != "string") {
      this.data.date = ""
    }
    if (typeof this.data.matchStartingTime != "string") {
      this.data.matchStartingTime = ""
    }
    if (typeof this.data.secondRoundName != "string") {
      this.data.secondRoundName = ""
    }
    if (typeof this.data.password != "string") {
      this.data.password = ""
    }
    let date=new Date()
    this.data = {
      matchId: this.matchId,
      priority:1,
      matchDetails:{
        tournamentName: this.data.tournamentName,
        tournamentYear:this.data.tournamentYear,
        groupName:this.data.groupName,
        secondRoundName:this.data.secondRoundName,
        matchNumber: this.data.matchNumber,
        venue: this.data.venue,
        firstTeam: this.data.firstTeam,
        secondTeam: this.data.secondTeam,
        firstTeamTeamList:[],
        secondTeamTeamList:[],
        battersIndexes:[],
        bowlersIndexes:[],
        retiredHurtPlayers:[],
        dateOfTheMatch:this.data.date,
        matchStartingTime: this.data.matchStartingTime,
        isStarted: false,
        isDraw:false,
        tossWonBy: null,
        decidedTo: null,
        inningsStatus: null,
        isInningsCompleted:false,
        overs: null,
        target: null,
        isFinished: false,
        manOfTheMatch: null,
        winningStatus: null,
        winningTeam:null,
        lossingTeam:null,
        scorerName: null,
        commentry: [],
      },
      state:{
      wicketFallen:false,
      batsmanNumber:0,
      strikerIndex:null,
      nonStrikerIndex:null,
      bowlerNumber:0,
      bowlerIndex:null,
      previousBowlerIndex:null,
      overFinished:false
      },
      eachOver:{
        perOverRuns:0,
        ballNumber:0,
        lastOverRuns:0
      },
      extras:{
        totalWideBalls:0,
        totalNoBalls:0,
        totalByeRuns:0,
        totalLegByeRuns:0,
        paneltyRuns:0
      },
      liveScore: {
        totalRuns: 0,
        totalWickets: 0,
        totalOvers: 0,
        partnershipRuns:0,
        partnershipBalls:0,
        lastWicketDetails: "No wicket fallen."
      },
      firstInningsScore:{},
      firstInningsExtras:{},
      firstInningsBatting:{
        allBatsman:[],
      },
      firstInningsBowling:{
        allBowlers:[]
      },
      firstInningsFallOfWickets:[],
      firstInningsBallTracking:{balls:" "},
      secondInningsBatting:{
        allBatsman:[]
      },
      secondInningsBowling:{
        allBowlers:[]
      },
      secondInningsFallOfWickets:[],
      secondInningsScore:{},
      secondInningsExtras:{},
      secondInningsBallTracking:{balls:" "},
      password: this.data.password,
      emergency:{
        hasEmergency:false,
        emergencyMessage:null,
      },
      matchCancled:{
        hasCancled:false,
        canclationMessage:null
      },
      matchFinished:false
    }
  } catch {
    res.render("404")
  }
}

LiveScoreRoom.prototype.validate = function () {
  if (this.data.tournamentName == "") {
    this.errors.push("You must provide tournament name.")
  }
  if (this.data.groupName == "") {
    this.errors.push("You must provide group name.")
  }
  if (this.data.matchNumber == "") {
    this.errors.push("You must provide match number.")
  }
  if (this.data.venue == "") {
    this.errors.push("You must enter vanue name.")
  }
  if (this.data.firstTeam == "") {
    this.errors.push("You must provide first team name.")
  }
  if (this.data.secondTeam == "") {
    this.errors.push("You must provide second team name.")
  }
  if (this.data.date == "") {
    this.errors.push("You must provide date of the match.")
  }
  if (this.data.matchStartingTime == "") {
    this.errors.push("You must provide starting time of the match.")
  }
  if (this.data.secondTeam == "") {
    this.errors.push("You must provide second team name.")
  }
  if (this.data.password == "") {
    this.errors.push("You must provide a password.")
  }
}

LiveScoreRoom.prototype.createRoom = function () {
  return new Promise(async (resolve, reject) => {
    try {
      await this.cleanUp()
      this.validate()
     if (!this.errors.length) {
        await liveRoomCollection.insertOne(this.data)
        await administrationCollection.findOneAndUpdate({regNumber:'21sclwoNeededData9999'},
        { $inc: { "matchNumber": 1 } }
        );
        resolve(this.matchId)
      } else {
        reject(this.errors)
      }
    } catch {
      this.errors.push("There is some problem!")
      reject(this.errors)
    }
  })
}

LiveScoreRoom.deleteRoom = function(id) {
  return new Promise(async function(resolve, reject) {
    try{
      await liveRoomCollection.deleteOne({_id: new ObjectId(id)})
      resolve()
    }catch{
      reject()
    }
  })
}

LiveScoreRoom.prototype.LiveScoreRoomControllerLogin = function () {
  return new Promise((resolve, reject) => {
    try {
      if (typeof this.data.matchId != "string") {
        this.data.matchId = ""
      }
      if (typeof this.data.password != "string") {
        this.data.password = ""
      }
      liveRoomCollection
        .findOne({ matchId: this.data.matchId })
        .then(roomData => {
          if (roomData.password == this.data.password) {
            this.data = roomData
            resolve("Congrats!")
          } else {
            reject("Invalid matchId / password.")
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

LiveScoreRoom.matchStarted = function (data, matchId) {
  return new Promise(async (resolve, reject) => {
    let commentry = {
      comment: "The match is going to start.",
      commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    try {
      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            "matchDetails.isStarted": true,
            "priority":3,
            "matchDetails.scorerName": data.scorerName
          },
          $push: {
            "matchDetails.commentry": commentry
          }
        }
      )
      resolve()
    } catch {
      this.errors.push("There is some problem!")
      reject(this.errors)
    }
  })
}

LiveScoreRoom.createTeamList = function (data, matchId) {
  return new Promise(async (resolve, reject) => {
    try {
      let comment="Team list of "+data.clubName+" is submittred.Team list : "
      let playerName
      let listedPlayersName=[]
      data.listedPlayers.forEach((player)=>{
        if(player.userName==player.regNumber){
          player.regNumber="Not registered"
        }
        listedPlayersName.push(player)
        playerName=player.userName+","
        comment=comment.concat(playerName)
      })
      let databaseField
      if(data.teamListOf=="firstTeamTeamList"){
        databaseField="matchDetails.firstTeamTeamList"
      }else if(data.teamListOf=="secondTeamTeamList"){
        databaseField="matchDetails.secondTeamTeamList"
      }else{
        databaseField="none"
      }
      let commentry = {
        comment: comment,
        commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
      if(databaseField!="none"){
        await liveRoomCollection.findOneAndUpdate(
          { matchId: matchId },
          {
            $set: {
              [databaseField]: listedPlayersName
            },
            $push: {
              "matchDetails.commentry": commentry
            }
          }
        )
        resolve()
      }else{
        reject("Data change detected!!")
      }
    } catch {
      reject("There is some problem.Try again..")
    }
  })
}

LiveScoreRoom.startSecondInnings = function (matchId) {
  return new Promise(async (resolve, reject) => {
    let commentry = {
      comment: "SECOND INNINGS IS GOING TO START.",
      commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    let state={
      wicketFallen:false,
      batsmanNumber:0,
      strikerIndex:null,
      nonStrikerIndex:null,
      bowlerNumber:0,
      bowlerIndex:null,
      previousBowlerIndex:null,
      overFinished:false
    }
    let eachOver={
      perOverRuns:0,
      ballNumber:0,
      lastOverRuns:0
    }
    let extras={
      totalWideBalls:0,
      totalNoBalls:0,
      totalByeRuns:0,
      totalLegByeRuns:0,
      paneltyRuns:0
    }
    let liveScore={
      totalRuns: 0,
      totalWickets: 0,
      totalOvers: 0,
      partnershipRuns:0,
      partnershipBalls:0,
      lastWicketDetails: "No wicket till now."
    }
    try {
      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            "matchDetails.inningsStatus":"2nd Innings",
            "matchDetails.battersIndexes":[],
            "matchDetails.bowlersIndexes":[],
            "matchDetails.retiredHurtPlayers":[],
            "state":state,
            "eachOver":eachOver,
            "extras":extras,
            "liveScore":liveScore,
            "matchDetails.isInningsCompleted":false
          },
          $push: {
            "matchDetails.commentry": commentry
          }
        }
      )
      resolve()
    } catch {
      this.errors.push("There is some problem!")
      reject(this.errors)
    }
  })
}

LiveScoreRoom.tossDetails = function (data, matchId) {
  return new Promise(async (resolve, reject) => {
    let winningTeam
    if(data.tossWonBy=="firstTeam"){
      winningTeam=data.firstTeam
    }else{
      winningTeam=data.secondTeam
    }
    let comment=winningTeam+" won the toss and decided to "+data.decidedTo+" first."
    let commentry = {
      comment: comment,
      commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    let overs=Number(data.overs)
    try {
      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            "matchDetails.inningsStatus": data.inningsStatus,
            "matchDetails.tossWonBy": data.tossWonBy,
            "matchDetails.decidedTo": data.decidedTo,
            "matchDetails.overs": overs,
          },
          $push: {
            "matchDetails.commentry": commentry
          }
        }
      )
      resolve()
    } catch {
      this.errors.push("There is some problem!")
      reject(this.errors)
    }
  })
}

LiveScoreRoom.addBatsman = function (data, matchId) {
  return new Promise(async (resolve, reject) => {
    let roomData = await liveRoomCollection.findOne({ matchId:matchId })
    let state=roomData.state
    let batsmanNumber=state.batsmanNumber+1
    let ballNumber=roomData.eachOver.ballNumber
    let comment
    let batsmanAddPosition
    if(roomData.matchDetails.inningsStatus=="1st Innings"){
      batsmanAddPosition="firstInningsBatting.allBatsman"
    }else if(roomData.matchDetails.inningsStatus=="2nd Innings"){
      batsmanAddPosition="secondInningsBatting.allBatsman"
    }
    if (state.strikerIndex==null){
      comment="Striker batsman is "+data.batterName
    }else if(state.nonStrikerIndex==null){
      comment="Non-Striker batsman is "+data.batterName
    }else{
      comment="New batsman is "+data.batterName
    }
    let commentry = {
      comment: comment,
      commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    let batsmanData={
      name:data.batterName,
      regNumber:data.batterRegNumber,
      runs:0,
      balls:0,
      fours:0,
      sixes:0,
      ballsTracking:"",
      battingStartedAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }),
      battingFinishedAt:null,
      isOut:false,
      isRetiredHurt:false,
      outType:null,
      filderName:null,
      outBy:null
    }
    try {
      if(state.strikerIndex!=null && state.nonStrikerIndex!=null && state.wicketFallen && ballNumber==0){
        await liveRoomCollection.findOneAndUpdate(
          { matchId: matchId },
          {
            $set: {
              "state.nonStrikerIndex": state.batsmanNumber,
              "state.batsmanNumber": batsmanNumber,
              "state.wicketFallen":false
            },
            $push: {
              [batsmanAddPosition]:batsmanData,
              "matchDetails.battersIndexes":data.batterIndex,
              "matchDetails.commentry": commentry
            }
          }
        )
      }else if (state.strikerIndex==null || state.wicketFallen){
        await liveRoomCollection.findOneAndUpdate(
          { matchId: matchId },
          {
            $set: {
              "state.strikerIndex": state.batsmanNumber,
              "state.batsmanNumber": batsmanNumber,
              "state.wicketFallen":false
            },
            $push: {
              [batsmanAddPosition]:batsmanData,
              "matchDetails.battersIndexes":data.batterIndex,
              "matchDetails.commentry": commentry
            }
          }
        )
      }else if(state.nonStrikerIndex==null){
        await liveRoomCollection.findOneAndUpdate(
          { matchId: matchId },
          {
            $set: {
              "state.nonStrikerIndex": state.batsmanNumber,
              "state.batsmanNumber": batsmanNumber,
            },
            $push: {
              [batsmanAddPosition]:batsmanData,
              "matchDetails.battersIndexes":data.batterIndex,
              "matchDetails.commentry": commentry
            }
          }
        )
      }
      resolve()
    } catch {
      this.errors.push("There is some problem!")
      reject(this.errors)
    }
  })
}

LiveScoreRoom.addNewBowler = function (data, matchId) {
  return new Promise(async (resolve, reject) => {
    let roomData = await liveRoomCollection.findOne({ matchId:matchId })
    let state=roomData.state
    let bowlerNumber=state.bowlerNumber+1
    let comment="New bowler is "+data.newBowlerName
    let bowlerAddedOnField
    if (roomData.matchDetails.inningsStatus=="1st Innings"){
      bowlerAddedOnField="firstInningsBowling.allBowlers"
    }else if(roomData.matchDetails.inningsStatus=="2nd Innings"){
      bowlerAddedOnField="secondInningsBowling.allBowlers"
    }
    let commentry = {
      comment: comment,
      commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    let bowlerData={
      name:data.newBowlerName,
      regNumber:data.newBowlerRegNumber,
      runs:0,
      wickets:0,
      overs:0,
      madenOvers:0,
      wideBalls:0,
      noBalls:0,
      trackingBalls:"",
    }
    try {
        await liveRoomCollection.findOneAndUpdate(
          { matchId: matchId },
          {
            $set: {
              "state.bowlerIndex": state.bowlerNumber,
              "state.bowlerNumber": bowlerNumber,
              "state.overFinished": false,
              "eachOver.perOverRuns": 0,
              "eachOver.ballNumber": 0
            },
            $push: {
              [bowlerAddedOnField]:bowlerData,
              "matchDetails.bowlersIndexes":data.newBowlerIndex,
              "matchDetails.commentry": commentry
            }
          }
        ) 
      resolve()
    } catch {
      this.errors.push("There is some problem!")
      reject(this.errors)
    }
  })
}

LiveScoreRoom.selectBowler = function (data, matchId) {
  return new Promise(async (resolve, reject) => {
    let index=Number(data.selectBowlerIndex)
    let roomData = await liveRoomCollection.findOne({ matchId:matchId })
    let bowlerName
    if (roomData.matchDetails.inningsStatus=="1st Innings"){
     bowlerName=roomData.firstInningsBowling.allBowlers[index].name
    }else if(roomData.matchDetails.inningsStatus=="2nd Innings"){
      bowlerName=roomData.secondInningsBowling.allBowlers[index].name
    }
    let comment=bowlerName+" is back on the bowling attack."
    let commentry = {
      comment: comment,
      commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    try {
        await liveRoomCollection.findOneAndUpdate(
          { matchId: matchId },
          {
            $set: {
              "state.bowlerIndex": index,
              "state.overFinished": false,
              "eachOver.perOverRuns": 0,
              "eachOver.ballNumber": 0
            },
            $push: {
              "matchDetails.commentry": commentry
            }
          }
        )
      resolve()
    } catch {
      this.errors.push("There is some problem!")
      reject(this.errors)
    }
  })
}

LiveScoreRoom.matchCommentry = function (data, matchId) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof data.matchComment != "string") {
        reject()
        return
      }
      let commentry = {
        comment: data.matchComment,
        commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $push: {
            "matchDetails.commentry": commentry
          }
        }
      )
      resolve()
    } catch {
      reject()
    }
  })
}

LiveScoreRoom.manOfTheMatch = function (data, matchId) {
  return new Promise(async (resolve, reject) => {
    try {
      let commentry = {
        comment: "The game is over.Player of the match is - "+data.manOfTheMatch,
        commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
      if (typeof data.manOfTheMatch != "string") {
        reject()
      }
        await liveRoomCollection.findOneAndUpdate(
          { matchId: matchId },
          {
            $set: {
              "matchDetails.manOfTheMatch": data.manOfTheMatch,
              "priority":2,
              "matchDetails.isInningsCompleted": true,
              "matchDetails.isFinished": true,
              "matchDetails.inningsStatus":"completed"
            },
            $push: {
              "matchDetails.commentry": commentry
            }
          }
        )
      
      resolve()
    } catch {
      this.errors.push("There is some problem!")
      reject(this.errors)
    }
  })
}


LiveScoreRoom.findSingleRoomById = function(id) {
  return new Promise(async function(resolve, reject) {
    try{
      if (typeof(id) != "string" || !ObjectId.isValid(id)) {
        reject()
        return
      }
      let room = await liveRoomCollection.findOne({_id: new ObjectId(id)})
      if (room) {
        resolve(room)
      } else {
        reject()
      }
    }catch{
      reject()
    } 
  })
}


LiveScoreRoom.addScoreCardLink = function(scoreCardLink,id) {
  return new Promise(async (resolve, reject)=> {
    try{
      await liveRoomCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {
          $set:{
            "scoreCardLink":scoreCardLink
          }
        })
     resolve()
    }catch{
      reject()
    }
   
  })
}

LiveScoreRoom.addEmergencyMessage = function(matchId,emergencyMessage) {
  return new Promise(async (resolve, reject)=> {
    try{
      let emergency={
        hasEmergency:true,
        emergencyMessage:emergencyMessage
      }
      let commentry = {
        comment: emergencyMessage,
        commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
      await liveRoomCollection.findOneAndUpdate(
        {matchId: matchId},
        {
          $set:{
            "emergency":emergency
          },
          $push: {
            "matchDetails.commentry": commentry
          }
        })
     resolve()
    }catch{
      reject()
    }
   
  })
}

LiveScoreRoom.removeEmergencyMessage = function(matchId) {
  return new Promise(async (resolve, reject)=> {
    try{
      let commentry = {
        comment: "Everything is ok now.Game is going to start.",
        commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
      let emergency={
        hasEmergency:false,
        emergencyMessage:null
      }
      await liveRoomCollection.findOneAndUpdate(
        {matchId: matchId},
        {
          $set:{
            "emergency":emergency
          },
          $push: {
            "matchDetails.commentry": commentry
          }
        })
     resolve()
    }catch{
      reject()
    }
   
  })
}



LiveScoreRoom.matchCancled = function(matchId,message) {
  return new Promise(async (resolve, reject)=> {
    try{
      let roomData=await liveRoomCollection.findOne({matchId:matchId})
      let commentry = {
        comment: message+" See you in the next match.",
        commentAt: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
      let matchCancled={
        hasCancled:true,
        canclationMessage:message
      }
      let status="Match has cancled.Points are distributed."
      await liveRoomCollection.findOneAndUpdate(
        {matchId: matchId},
        {
          $set:{
            "matchDetails.isDraw":true,
            "matchDetails.winningStatus":status,
            "matchDetails.winningTeam":roomData.matchDetails.firstTeam,
            "matchDetails.lossingTeam":roomData.matchDetails.secondTeam,
            "matchCancled":matchCancled,
            "matchFinished":true
          },
          $push: {
            "matchDetails.commentry": commentry
          }
        })
     resolve()
    }catch{
      reject()
    }
   
  })
}



// LiveScoreRoom.gettingRoomData = function (roomData, from) {
//  if(from=="guestHome"){
//     let data={
//       matchDetails:roomData.matchDetails
//     }
    
//     if(roomData.matchDetails.isStarted){
//       data.liveScore=roomData.liveScore
//       if((roomData.matchDetails.tossWonBy=="firstTeam" && roomData.matchDetails.decidedTo=="batting") || (roomData.matchDetails.tossWonBy=="secondTeam" && roomData.matchDetails.decidedTo=="bowling")){
//         data.batting.firstBattingTeam=roomData.matchDetails.firstTeam
//         data.batting.secondBattingTeam=roomData.matchDetails.secondTeam
//       }else if((roomData.matchDetails.tossWonBy=="firstTeam" && roomData.matchDetails.decidedTo=="bowling") || (roomData.matchDetails.tossWonBy=="secondTeam" && roomData.matchDetails.decidedTo=="batting")){
//         data.batting.firstBattingTeam=roomData.matchDetails.secondTeam
//         data.batting.secondBattingTeam=roomData.matchDetails.firstTeam
//       }
//     }
//   }
//   return data
// }
module.exports =LiveScoreRoom