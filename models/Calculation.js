
const liveRoomCollection = require("../db").db().collection("LiveMatchRoom")

let Calculation = function (data) {
  this.data = data
  this.errors = []
}
Calculation.prototype.cleanUp =function () {
  if (typeof this.data.ballType != "string") {
    this.data.ballType = ""
  }
  
  this.data={
    ballType:this.data.ballType,
    run:Number(this.data.run)
  }
}
Calculation.prototype.validate = function () {
  if (this.data.ballType == "") {
    this.errors.push("You must provide a password.")
  }
  
  if(this.data.run>6 && this.data.run>=0){
    this.errors.push("Total run in a single ball can not more than 6 and can't less than 0.")
  }
}
Calculation.prototype.calculations = function (matchId) {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanUp()
      this.validate()
      
     if (!this.errors.length) {
       //different part of calculation function will be called from here.
        
        await this.addBatsmanRuns(matchId)
        await this.addBowlerValues(matchId)
        await this.extraRunsUpdate(matchId)
        await this.eachBallCommentry(matchId)
        if(this.data.run%2!=0){
          await this.changeStrike(matchId)
        }
        let overCompleted=await this.isOverCompleted(matchId)
        if(overCompleted){
          await this.changeStrike(matchId)
        }
        await this.inningsStatusCheck(matchId)
        resolve()
      } else {
        reject(this.errors)
      }
    } catch {
      this.errors.push("There is some problem!!")
      reject(this.errors)
    }
  })
}

Calculation.prototype.addBatsmanRuns=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     
     let strikerIndex=roomData.state.strikerIndex
     let Index=String(strikerIndex)
     let strikerBatsmanRunsPosition
     let strikerBatsmanBallsPosition
     let strikerBatsmanFoursPosition
     let strikerBatsmanSixesPosition
     let strikerBatsmanBallsTrackingPosition
     let nowFours
     let nowRuns
     let nowBalls
     let nowSixes
     let scoreOnTheBall
     let ballsTracking

     if (roomData.matchDetails.inningsStatus=="1st Innings"){
       nowFours=roomData.firstInningsBatting.allBatsman[strikerIndex].fours
       nowSixes=roomData.firstInningsBatting.allBatsman[strikerIndex].sixes   
       nowRuns=roomData.firstInningsBatting.allBatsman[strikerIndex].runs      
       nowBalls=roomData.firstInningsBatting.allBatsman[strikerIndex].balls
       ballsTracking=roomData.firstInningsBatting.allBatsman[strikerIndex].ballsTracking
      if( this.data.ballType=="ok" || this.data.ballType=="noBallRunBat"){
        nowRuns=nowRuns+this.data.run
        
        if(this.data.run==4){
          nowFours=nowFours+1
        }
        if(this.data.run==6){
          nowSixes=nowSixes+1
        }
      }
      if(this.data.ballType!="wideBall"){
        nowBalls=nowBalls+1
      }
 
      strikerBatsmanRunsPosition="firstInningsBatting.allBatsman."+Index+".runs"
      strikerBatsmanBallsPosition="firstInningsBatting.allBatsman."+Index+".balls"
      strikerBatsmanFoursPosition="firstInningsBatting.allBatsman."+Index+".fours"
      strikerBatsmanSixesPosition="firstInningsBatting.allBatsman."+Index+".sixes"
      strikerBatsmanBallsTrackingPosition="firstInningsBatting.allBatsman."+Index+".ballsTracking"

    }else if(roomData.matchDetails.inningsStatus=="2nd Innings"){
      nowFours=roomData.secondInningsBatting.allBatsman[strikerIndex].fours
      nowSixes=roomData.secondInningsBatting.allBatsman[strikerIndex].sixes   
      nowRuns=roomData.secondInningsBatting.allBatsman[strikerIndex].runs      
      nowBalls=roomData.secondInningsBatting.allBatsman[strikerIndex].balls
      ballsTracking=roomData.secondInningsBatting.allBatsman[strikerIndex].ballsTracking
      
     if(this.data.ballType=="ok" || this.data.ballType=="noBallRunBat"){
       nowRuns=nowRuns+this.data.run
       
       if(this.data.run==4){
         nowFours=nowFours+1
       }
       if(this.data.run==6){
         nowSixes=nowSixes+1
       }
     }
     if(this.data.ballType!="wideBall"){
      nowBalls=nowBalls+1
    }
      strikerBatsmanRunsPosition="secondInningsBatting.allBatsman."+Index+".runs"
      strikerBatsmanBallsPosition="secondInningsBatting.allBatsman."+Index+".balls"
      strikerBatsmanFoursPosition="secondInningsBatting.allBatsman."+Index+".fours"
      strikerBatsmanSixesPosition="secondInningsBatting.allBatsman."+Index+".sixes"
      strikerBatsmanBallsTrackingPosition="secondInningsBatting.allBatsman."+Index+".ballsTracking"
      
    }
      
     await liveRoomCollection.findOneAndUpdate(
      { matchId: matchId },
      {
        $set: {
          [strikerBatsmanRunsPosition]: nowRuns,
          [strikerBatsmanBallsPosition]: nowBalls,
          [strikerBatsmanFoursPosition]: nowFours,
          [strikerBatsmanSixesPosition]: nowSixes,
          
        }
      }
    )
    if(this.data.ballType=="ok" || this.data.ballType=="noBallRunBat" ||this.data.ballType=="byeRun" || this.data.ballType=="noBallRunBye"){
      if(this.data.ballType=="ok" || this.data.ballType=="noBallRunBat" ){
        scoreOnTheBall=ballsTracking+String(this.data.run)+" ,"   
      }else{
        scoreOnTheBall=ballsTracking+"0 ,"
      }
      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set:{
            [strikerBatsmanBallsTrackingPosition]:scoreOnTheBall
          }
        }
      )
    }
    resolve()
    } catch {
      this.errors.push("There is some problem on add batsman run function.")
      reject(this.errors)
    }
  })
}

Calculation.prototype.addBowlerValues=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     let totalRuns=roomData.liveScore.totalRuns
     
     let partnershipRuns=roomData.liveScore.partnershipRuns
     let partnershipBalls=roomData.liveScore.partnershipBalls

     let bowlerIndex=roomData.state.bowlerIndex
     let Index=String(bowlerIndex)
     let perOverRuns=roomData.eachOver.perOverRuns
     let ballNumber=roomData.eachOver.ballNumber
     
     let bowlerRunsPosition
     let bowlerWideBallsPosition
     let bowlerNoBallsPosition
     let bowlerBallsTrackingPosition

     let nowRuns
     let nowWideBalls
     let nowNoBalls
     let nowTrackingBalls
     
     
     //Total runs updation
     totalRuns=totalRuns+this.data.run
     partnershipRuns=partnershipRuns+this.data.run

     if (roomData.matchDetails.inningsStatus=="1st Innings"){
       nowRuns=roomData.firstInningsBowling.allBowlers[bowlerIndex].runs
       nowNoBalls=roomData.firstInningsBowling.allBowlers[bowlerIndex].noBalls      
       nowWideBalls=roomData.firstInningsBowling.allBowlers[bowlerIndex].wideBalls
       nowWideBalls=roomData.firstInningsBowling.allBowlers[bowlerIndex].wideBalls
       nowTrackingBalls=roomData.firstInningsBowling.allBowlers[bowlerIndex].trackingBalls

      if(this.data.run<7 && this.data.run>=0){
        perOverRuns=perOverRuns+this.data.run
        if(this.data.ballType=="ok" || this.data.ballType=="noBallRunBat" || this.data.ballType=="wideBall"){
          nowRuns=nowRuns+this.data.run
        }

        if(this.data.ballType=="wideBall"){
          partnershipRuns=partnershipRuns+1  
          totalRuns=totalRuns+1
          nowWideBalls=nowWideBalls+1+this.data.run
          nowRuns=nowRuns+1
          perOverRuns=perOverRuns+1
        }
        if(this.data.ballType=="noBallRunBye" || this.data.ballType=="noBallRunBat" || this.data.ballType=="noBallRunLegBye"){
          partnershipRuns=partnershipRuns+1
          totalRuns=totalRuns+1
          nowNoBalls=nowNoBalls+1
          nowRuns=nowRuns+1
          perOverRuns=perOverRuns+1
          partnershipBalls=partnershipBalls+1
        }
        if(this.data.ballType=="ok" || this.data.ballType=="legByeRun" || this.data.ballType=="byeRun"){
          ballNumber=ballNumber+1
          partnershipBalls=partnershipBalls+1
        }
      }
      
 
      bowlerRunsPosition="firstInningsBowling.allBowlers."+Index+".runs"
      bowlerNoBallsPosition="firstInningsBowling.allBowlers."+Index+".noBalls"
      bowlerWideBallsPosition="firstInningsBowling.allBowlers."+Index+".wideBalls"
      bowlerBallsTrackingPosition="firstInningsBowling.allBowlers."+Index+".trackingBalls"
      
    }else if(roomData.matchDetails.inningsStatus=="2nd Innings"){
      nowRuns=roomData.secondInningsBowling.allBowlers[bowlerIndex].runs
      nowNoBalls=roomData.secondInningsBowling.allBowlers[bowlerIndex].noBalls      
      nowWideBalls=roomData.secondInningsBowling.allBowlers[bowlerIndex].wideBalls
      nowTrackingBalls=roomData.secondInningsBowling.allBowlers[bowlerIndex].trackingBalls
       
     if(this.data.run<7 && this.data.run>=0){
       perOverRuns=perOverRuns+this.data.run
       if(this.data.ballType=="ok" || this.data.ballType=="noBallRunBat" || this.data.ballType=="wideBall"){
         nowRuns=nowRuns+this.data.run
       }

       if(this.data.ballType=="wideBall"){
        partnershipRuns=partnershipRuns+1 
        totalRuns=totalRuns+1
         nowWideBalls=nowWideBalls+1
         nowRuns=nowRuns+1
         perOverRuns=perOverRuns+1
       }
       if(this.data.ballType=="noBallRunBye" || this.data.ballType=="noBallRunBat" || this.data.ballType=="noBallRunLegBye"){
        partnershipRuns=partnershipRuns+1 
        totalRuns=totalRuns+1
        nowNoBalls=nowNoBalls+1
         nowRuns=nowRuns+1
         perOverRuns=perOverRuns+1
         partnershipBalls=partnershipBalls+1
       }
       if(this.data.ballType=="ok" || this.data.ballType=="legByeRun" || this.data.ballType=="byeRun"){
        ballNumber=ballNumber+1
        partnershipBalls=partnershipBalls+1
      }
     }
     bowlerRunsPosition="secondInningsBowling.allBowlers."+Index+".runs"
     bowlerNoBallsPosition="secondInningsBowling.allBowlers."+Index+".noBalls"
     bowlerWideBallsPosition="secondInningsBowling.allBowlers."+Index+".wideBalls"
     bowlerBallsTrackingPosition="secondInningsBowling.allBowlers."+Index+".trackingBalls"
    }
    let entry
    if(this.data.ballType=="ok"){
      entry=String(this.data.run)+","
      nowTrackingBalls=nowTrackingBalls.concat(entry)
    }else if(this.data.ballType=="wideBall"){
      entry=String(this.data.run)+"wd,"
      nowTrackingBalls=nowTrackingBalls.concat(entry)
    }else if(this.data.ballType=="legByeRun" || this.data.ballType=="byeRun"){
      entry=String(this.data.run)+"lb,"
      nowTrackingBalls=nowTrackingBalls.concat(entry)
    }else if(this.data.ballType=="noBallRunBye" || this.data.ballType=="noBallRunBat" || this.data.ballType=="noBallRunLegBye"){
      entry=String(this.data.run)+"no,"
      nowTrackingBalls=nowTrackingBalls.concat(entry)
    }
      
     await liveRoomCollection.findOneAndUpdate(
      { matchId: matchId },
      {
        $set: {
          [bowlerRunsPosition]: nowRuns,
          [bowlerWideBallsPosition]: nowWideBalls,
          [bowlerNoBallsPosition]: nowNoBalls,  
          [bowlerBallsTrackingPosition]: nowTrackingBalls,
          "liveScore.totalRuns":totalRuns,
          "eachOver.perOverRuns":perOverRuns,
          "eachOver.ballNumber":ballNumber,
          "liveScore.partnershipRuns":partnershipRuns,
          "liveScore.partnershipBalls":partnershipBalls
        }
      }
    )
    resolve()
    } catch {
      this.errors.push("There is some problem on bowler values adding function.")
      reject(this.errors)
    }
  })
}

Calculation.prototype.isOverCompleted=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     let ballNumber=roomData.eachOver.ballNumber
     let inningsBallTracking
     let inningsBallTrackingPosition

     if(ballNumber==6){
      let perOverRuns=roomData.eachOver.perOverRuns
      
       let bowlerIndex=roomData.state.bowlerIndex
       let previousBowlerIndex=roomData.state.previousBowlerIndex
       if(previousBowlerIndex==null){
        previousBowlerIndex=0
       }
       let totalOvers=roomData.liveScore.totalOvers+1
       let Index=String(bowlerIndex)
      let bowlerMadenOversPosition
      let bowlerOversPosition
      let nowMadenOvers
      let overs

       
       if(roomData.matchDetails.inningsStatus=="1st Innings"){
        nowMadenOvers=roomData.firstInningsBowling.allBowlers[bowlerIndex].madenOvers
        overs=roomData.firstInningsBowling.allBowlers[bowlerIndex].overs
        if(roomData.eachOver.perOverRuns==0){
          nowMadenOvers=nowMadenOvers+1
        }
        bowlerMadenOversPosition="firstInningsBowling.allBowlers."+Index+".madenOvers"
        bowlerOversPosition="firstInningsBowling.allBowlers."+Index+".overs"
        
        inningsBallTrackingPosition="firstInningsBallTracking.balls"
        inningsBallTracking=roomData.firstInningsBallTracking.balls
     
      }else if(roomData.matchDetails.inningsStatus=="2nd Innings"){
        nowMadenOvers=roomData.secondInningsBowling.allBowlers[bowlerIndex].madenOvers
        overs=roomData.secondInningsBowling.allBowlers[bowlerIndex].overs
        if(roomData.eachOver.perOverRuns==0){
          nowMadenOvers=nowMadenOvers+1
        }
        bowlerMadenOversPosition="secondInningsBowling.allBowlers."+Index+".madenOvers"
        bowlerOversPosition="secondInningsBowling.allBowlers."+Index+".overs"
     
        inningsBallTrackingPosition="secondInningsBallTracking.balls"
        inningsBallTracking=roomData.secondInningsBallTracking.balls
      }
      inningsBallTracking=inningsBallTracking+" |,"
      let comment="**After "+(totalOvers)+" overs "+String(roomData.liveScore.totalRuns)+"/"+String(roomData.liveScore.totalWickets)+"**"
      let commentry={
        comment:comment,
        commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
       await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            [bowlerMadenOversPosition]:nowMadenOvers,
            [bowlerOversPosition]:overs+1,
            [inningsBallTrackingPosition]:inningsBallTracking,
            "liveScore.totalOvers":totalOvers,
            "state.overFinished":true,
            "state.previousBowlerIndex":bowlerIndex,
            "state.bowlerIndex":previousBowlerIndex,
            "eachOver.perOverRuns":0,
            "eachOver.ballNumber":0,
            "eachOver.lastOverRuns":perOverRuns
          },
          $push:{
            "matchDetails.commentry":commentry
          }
        }
      )
      resolve(true)
     }else{
      resolve(false)
     }
    
    } catch {
      this.errors.push("There is some problem on isOverComplete function .")
      reject(this.errors)
    }
  })
}

Calculation.prototype.extraRunsUpdate=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     let totalWideBalls=roomData.extras.totalWideBalls
     let totalNoBalls=roomData.extras.totalNoBalls
     let totalByeRuns=roomData.extras.totalByeRuns
     let totalLegByeRuns=roomData.extras.totalLegByeRuns
     
    if(this.data.ballType=="wideBall"){
      totalWideBalls=totalWideBalls+1+this.data.run
    }
    if(this.data.ballType=="noBallRunBye" || this.data.ballType=="noBallRunBat" || this.data.ballType=="noBallRunLegBye"){
      totalNoBalls=totalNoBalls+1
    }
    if(this.data.ballType=="byeRun" || this.data.ballType=="noBallRunBye"){
      totalByeRuns=totalByeRuns+this.data.run
    }
    if(this.data.ballType=="legByeRun" || this.data.ballType=="noBallRunLegBye"){
      totalLegByeRuns=totalLegByeRuns+this.data.run
    }
    
       await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            "extras.totalWideBalls":totalWideBalls,
            "extras.totalNoBalls":totalNoBalls,
            "extras.totalByeRuns":totalByeRuns,
            "extras.totalLegByeRuns":totalLegByeRuns, 
          }
        }
      )
      resolve() 
    } catch {
      this.errors.push("There is some problem on extra runs updation function .")
      reject(this.errors)
    }
  })
}

Calculation.prototype.changeStrike=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
     let data=await liveRoomCollection.findOne({matchId:matchId})
     let strikerIndex=data.state.strikerIndex
     let nonStrikerIndex=data.state.nonStrikerIndex
     await liveRoomCollection.findOneAndUpdate(
      { matchId: matchId },
      {
        $set: {
          "state.strikerIndex": nonStrikerIndex,
          "state.nonStrikerIndex": strikerIndex,
        }
      }
    )
    resolve()
    } catch {
      this.errors.push("There is some problem on strike changing function.")
      reject(this.errors)
    }
  })
}

Calculation.prototype.inningsStatusCheck=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
      let totalWickets=roomData.liveScore.totalWickets
      let totalOvers=roomData.liveScore.totalOvers
      let oversToPlay=roomData.matchDetails.overs
      let firstBattingTeam
      let secondBattingTeam
      let secondInningsFinished=false
      let winningStatus
      let secondInningsScore
      let secondInningsExtras
      let drawStatus=false

      if(roomData.matchDetails.inningsStatus=="1st Innings"){
        if(totalWickets==10 || totalOvers==oversToPlay){
          let firstInningsScore={
            totalRuns:roomData.liveScore.totalRuns,
            totalOvers:roomData.liveScore.totalOvers,
            ballNumber:roomData.eachOver.ballNumber,
            totalWickets:roomData.liveScore.totalWickets,
          }
          let firstInningsExtras=roomData.extras
          let target=roomData.liveScore.totalRuns+1

          let comment="First Innings has finished.Target is "+String(roomData.liveScore.totalRuns+1)+" in "+String(roomData.matchDetails.overs)+" Overs."
          let commentry={
            comment:comment,
            commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
          }
          await liveRoomCollection.findOneAndUpdate(
            { matchId: matchId },
            {
              $set: {
                "firstInningsScore":firstInningsScore,
                "firstInningsExtras":firstInningsExtras,
                "matchDetails.isInningsCompleted":true,
                "matchDetails.target":target
              },
              $push:{
                "matchDetails.commentry":commentry
              }
              
            }
          )
        }
      }

      if(roomData.matchDetails.inningsStatus=="2nd Innings"){
          //getting first batting and second batting team name
          
          if((roomData.matchDetails.tossWonBy=="firstTeam" && roomData.matchDetails.decidedTo=="batting") || (roomData.matchDetails.tossWonBy=="secondTeam" && roomData.matchDetails.decidedTo=="bowling")){
            firstBattingTeam=roomData.matchDetails.firstTeam
            secondBattingTeam=roomData.matchDetails.secondTeam
          }else if((roomData.matchDetails.tossWonBy=="firstTeam" && roomData.matchDetails.decidedTo=="bowling") || (roomData.matchDetails.tossWonBy=="secondTeam" && roomData.matchDetails.decidedTo=="batting")){
            firstBattingTeam=roomData.matchDetails.secondTeam
            secondBattingTeam=roomData.matchDetails.firstTeam
          }
          secondInningsScore={
            totalRuns:roomData.liveScore.totalRuns,
            totalOvers:roomData.liveScore.totalOvers,
            ballNumber:roomData.eachOver.ballNumber,
            totalWickets:roomData.liveScore.totalWickets,
          }
          secondInningsExtras=roomData.extras

          let winningTeamName
          let lossingTeamName
          if(roomData.liveScore.totalWickets==10 || roomData.liveScore.totalOvers==oversToPlay){
            //loss the match, code will be here
            //firstBatting team will won the match by runs
            let runsNeeded=String((roomData.matchDetails.target-1)-roomData.liveScore.totalRuns)
            winningStatus=firstBattingTeam+" won the match by "+runsNeeded+" runs."
            winningTeamName=firstBattingTeam
            lossingTeamName=secondBattingTeam
            secondInningsFinished=true
          }

        if(roomData.matchDetails.target <= roomData.liveScore.totalRuns){
          //win the match,code will be here
          //secondBatting team will won the match by wickets
          let wicketRemains=String(10-roomData.liveScore.totalWickets)
          winningStatus=secondBattingTeam+" won the match by "+wicketRemains+" wickets."
          winningTeamName=secondBattingTeam
          lossingTeamName=firstBattingTeam
          secondInningsFinished=true
        }
        if(roomData.matchDetails.target-1 == roomData.liveScore.totalRuns && roomData.liveScore.totalOvers==roomData.matchDetails.overs){
          //match is drawn
          winningStatus="Match has drawn."
          winningTeamName=roomData.matchDetails.firstTeam
          lossingTeamName=roomData.matchDetails.secondTeam
          drawStatus=true
          secondInningsFinished=true
        }
        if(secondInningsFinished){
          let comment=winningStatus
          let commentry={
            comment:comment,
            commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
          }
          
          let gameOver="game over"
          await liveRoomCollection.findOneAndUpdate(
            { matchId: matchId },
            {
              $set: {
                "secondInningsScore":secondInningsScore,
                "secondInningsExtras":secondInningsExtras,
                "matchFinished":true,
                "scoreCardLink":null,
                "matchDetails.isDraw":drawStatus,
                "matchDetails.inningsStatus":gameOver,
                "matchDetails.winningStatus":winningStatus,
                "matchDetails.winningTeam":winningTeamName,
                "matchDetails.lossingTeam":lossingTeamName
              },
              $push:{
                "matchDetails.commentry":commentry
              }
            }
          )
        }
      }

    resolve()
    } catch {
      this.errors.push("There is some problem on innings status check function.")
      reject(this.errors)
    }
  })
}


Calculation.prototype.afterRunOut=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
    await this.runOut(matchId)
    await this.inningsStatusCheck(matchId)
    resolve()
    } catch {
      this.errors.push("There is some problem on afterRunOut function.")
      reject(this.errors)
    }
  })
}


Calculation.prototype.afterGeneralOut=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
    await this.generalOut(matchId)
    let overCompleted=await this.isOverCompleted(matchId)
    if(overCompleted){
      await this.changeStrike(matchId)
     }
     await this.inningsStatusCheck(matchId)
    resolve()
    } catch {
      this.errors.push("There is some problem on afterGeneralOut function.")
      reject(this.errors)
    }
  })
}
Calculation.prototype.runOut=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
      let outType=this.data.outType
      let filderName=this.data.filderName

     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     let totalRuns=String(roomData.liveScore.totalRuns)
     let strikeBatsmanIndex=roomData.state.strikerIndex
     let IndexBatsman=String(strikeBatsmanIndex)
     let batsmanOutByPosition
     let batsmanIsOutPosition
     let totalWickets=roomData.liveScore.totalWickets+1
     let ballNumber=roomData.eachOver.ballNumber
     let overNumber=roomData.liveScore.totalOvers
     let strikerBatsmanIndex=roomData.state.strikerIndex
     let batsmanName
     let batsmanRuns
     let lastWicketDetails
     let innings
     let ballsTracking
     let batsmanBallsTrackingPosition
     let inningsBallTracking
     let inningsBallTrackingPosition
     let batsmanOutFilderNamePosition
     let batsmanOutTypePosition

     if(roomData.matchDetails.inningsStatus=="1st Innings"){
      innings="firstInningsFallOfWickets"
      batsmanName=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].name
      batsmanRuns=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].runs
      nowBalls=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].balls
      ballsTracking=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].ballsTracking
      lastWicketDetails=  batsmanName+" :"+String(batsmanRuns)+"("+String(nowBalls)+") (Run out) in "+String(overNumber)+"."+String(ballNumber)+" Ovs."
      
      inningsBallTrackingPosition="firstInningsBallTracking.balls"
      inningsBallTracking=roomData.firstInningsBallTracking.balls
   
      batsmanOutByPosition="firstInningsBatting.allBatsman."+IndexBatsman+".outBy"
      batsmanIsOutPosition="firstInningsBatting.allBatsman."+IndexBatsman+".isOut"    
      batsmanOutTypePosition="firstInningsBatting.allBatsman."+IndexBatsman+".outType" 
      batsmanOutFilderNamePosition="firstInningsBatting.allBatsman."+IndexBatsman+".filderName" 
        
      batsmanFinishedTimeAtPosition="firstInningsBatting.allBatsman."+IndexBatsman+".battingFinishedAt" 
      batsmanBallsTrackingPosition="firstInningsBatting.allBatsman."+IndexBatsman+".ballsTracking" 
      
    }else{
      innings="secondInningsFallOfWickets"
      ballsTracking=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].ballsTracking
      
      batsmanName=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].name
      batsmanRuns=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].runs
      nowBalls=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].balls
      lastWicketDetails=  batsmanName+" :"+String(batsmanRuns)+"("+String(nowBalls)+") (Run out) in "+String(overNumber)+"."+String(ballNumber)+" Ovs."
      ballsTracking=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].ballsTracking
      
      inningsBallTrackingPosition="secondInningsBallTracking.balls"
      inningsBallTracking=roomData.secondInningsBallTracking.balls
   
      batsmanOutByPosition="secondInningsBatting.allBatsman."+IndexBatsman+".outBy"
      batsmanIsOutPosition="secondInningsBatting.allBatsman."+IndexBatsman+".isOut"  
      batsmanOutTypePosition="secondInningsBatting.allBatsman."+IndexBatsman+".outType" 
      batsmanOutFilderNamePosition="secondInningsBatting.allBatsman."+IndexBatsman+".filderName" 
      batsmanFinishedTimeAtPosition="secondInningsBatting.allBatsman."+IndexBatsman+".battingFinishedAt" 
      batsmanBallsTrackingPosition="secondInningsBatting.allBatsman."+IndexBatsman+".ballsTracking" 
      
    }
    inningsBallTracking=inningsBallTracking+"run-out,"
    let outPosition={
      runs:totalRuns+"/"+String(totalWickets),
      overs:String(overNumber)+"."+String(ballNumber),
      batsman:batsmanName
    }
    let comment=String(overNumber)+"."+String(ballNumber)+" "+batsmanName+" is RUN OUT by "+filderName+"."
    let commentry={
      comment:comment,
      commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    ballsTracking=ballsTracking+"run-out"
    let runOut="Run Out"
    let out=true
    let time=new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    await liveRoomCollection.findOneAndUpdate(
      { matchId: matchId },
      {
        $set: {
          [batsmanIsOutPosition]:out,
          [batsmanOutByPosition]:runOut,
          [batsmanOutTypePosition]:outType,
          [batsmanOutFilderNamePosition]:filderName,
          [batsmanFinishedTimeAtPosition]:time,
          [batsmanBallsTrackingPosition]:ballsTracking,
          [inningsBallTrackingPosition]:inningsBallTracking,   
        }
      }
    )
    await liveRoomCollection.findOneAndUpdate(
      { matchId: matchId },
      {
        $set: {
          "liveScore.totalWickets":totalWickets,
          "liveScore.partnershipRuns":0,
          "liveScore.partnershipBalls":0,
          "state.wicketFallen":true,
          "liveScore.lastWicketDetails":lastWicketDetails       
        },
        $push:{
          [innings]:outPosition,
          "matchDetails.commentry":commentry,
        }
      }
    )
    resolve()
    } catch {
      this.errors.push("There is some problem on run out function.")
      reject(this.errors)
    }
  })
}

Calculation.prototype.generalOut=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
      let outType=this.data.outType
      let filderName=this.data.filderName
      
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     let totalRuns=String(roomData.liveScore.totalRuns)
    
     let bowlerIndex=roomData.state.bowlerIndex
     let ballNumber=roomData.eachOver.ballNumber+1
     let overNumber=roomData.liveScore.totalOvers
     let bowlerName
     let bowlerWickets
     let nowBalls
     let bowlerWicketPosition
     let bowlerBallsTrackingPosition
     let nowTrackingBalls
     let batsmanOutByPosition
     let batsmanBallsPosition
     let batsmanIsOutPosition
     let IndexBowler=String(bowlerIndex)
     let strikerBatsmanIndex=roomData.state.strikerIndex
     let IndexBatsman=String(strikerBatsmanIndex)
     let totalWickets=roomData.liveScore.totalWickets+1
      let batsmanName
      let batsmanRuns
     let lastWicketDetails
      let innings
     let batsmanFinishedTimeAtPosition
     let ballsTracking
     let batsmanBallsTrackingPosition
     let inningsBallTracking
     let inningsBallTrackingPosition
     let batsmanOutFilderNamePosition
     let batsmanOutTypePosition
     if(roomData.matchDetails.inningsStatus=="1st Innings"){
      innings="firstInningsFallOfWickets"
        bowlerWickets=roomData.firstInningsBowling.allBowlers[bowlerIndex].wickets+1
        bowlerName=roomData.firstInningsBowling.allBowlers[bowlerIndex].name
        nowTrackingBalls=roomData.firstInningsBowling.allBowlers[bowlerIndex].trackingBalls
        
        batsmanName=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].name
        batsmanRuns=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].runs
        nowBalls=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].balls+1
        ballsTracking=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].ballsTracking
      
        inningsBallTrackingPosition="firstInningsBallTracking.balls"
        inningsBallTracking=roomData.firstInningsBallTracking.balls
     
        bowlerWicketPosition="firstInningsBowling.allBowlers."+IndexBowler+".wickets"
        bowlerBallsTrackingPosition="firstInningsBowling.allBowlers."+IndexBowler+".trackingBalls"
      
        batsmanOutByPosition="firstInningsBatting.allBatsman."+IndexBatsman+".outBy"
        batsmanBallsPosition="firstInningsBatting.allBatsman."+IndexBatsman+".balls"  
        batsmanIsOutPosition="firstInningsBatting.allBatsman."+IndexBatsman+".isOut" 
        batsmanOutTypePosition="firstInningsBatting.allBatsman."+IndexBatsman+".outType" 
        batsmanOutFilderNamePosition="firstInningsBatting.allBatsman."+IndexBatsman+".filderName" 
        
        batsmanFinishedTimeAtPosition="firstInningsBatting.allBatsman."+IndexBatsman+".battingFinishedAt" 
        batsmanBallsTrackingPosition="firstInningsBatting.allBatsman."+IndexBatsman+".ballsTracking" 
      
        lastWicketDetails=  batsmanName+" :"+String(batsmanRuns)+"("+String(nowBalls)+")  Bowler:"+bowlerName+"  in "+String(overNumber)+"."+String(ballNumber)+" Ovs."
      }else{
        innings="secondInningsFallOfWickets"
        bowlerWickets=roomData.secondInningsBowling.allBowlers[bowlerIndex].wickets+1
        nowBalls=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].balls+1
        bowlerName=roomData.secondInningsBowling.allBowlers[bowlerIndex].name
        nowTrackingBalls=roomData.secondInningsBowling.allBowlers[bowlerIndex].trackingBalls
        
        batsmanName=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].name
        batsmanRuns=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].runs
        ballsTracking=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].ballsTracking
      
        inningsBallTrackingPosition="secondInningsBallTracking.balls"
        inningsBallTracking=roomData.secondInningsBallTracking.balls
     
        bowlerWicketPosition="secondInningsBowling.allBowlers."+IndexBowler+".wickets"
        bowlerBallsTrackingPosition="secondInningsBowling.allBowlers."+IndexBowler+".trackingBalls"
      
        batsmanBallsPosition="secondInningsBatting.allBatsman."+IndexBatsman+".balls"   
        batsmanOutByPosition="secondInningsBatting.allBatsman."+IndexBatsman+".outBy"
        batsmanIsOutPosition="secondInningsBatting.allBatsman."+IndexBatsman+".isOut" 
        batsmanOutTypePosition="secondInningsBatting.allBatsman."+IndexBatsman+".outType" 
        batsmanOutFilderNamePosition="secondInningsBatting.allBatsman."+IndexBatsman+".filderName" 
        
        batsmanFinishedTimeAtPosition="secondInningsBatting.allBatsman."+IndexBatsman+".battingFinishedAt" 
        batsmanBallsTrackingPosition="secondInningsBatting.allBatsman."+IndexBatsman+".ballsTracking" 
      
        lastWicketDetails=  batsmanName+" :"+String(batsmanRuns)+"("+String(nowBalls)+")  Bowler:"+bowlerName+"  in "+String(overNumber)+"."+String(ballNumber)+" Ovs."
      
      }
      inningsBallTracking=inningsBallTracking+"W,"
      let outPosition={
        runs:totalRuns+"/"+String(totalWickets),
        overs:String(overNumber)+"."+String(ballNumber),
        batsman:batsmanName
      }

      let type=""
      if(outType=="caught-out"){
        nowTrackingBalls=nowTrackingBalls+"caught,"
        type="It is caught out.Caught taken by "+filderName+"."
      }else if(outType=="lbw"){
        nowTrackingBalls=nowTrackingBalls+"lbw,"
        type="It is LBW."
      }else if(outType=="bowled"){
        nowTrackingBalls=nowTrackingBalls+"bowled,"
        type="It is clean bowled."
      }else if(outType=="stumping-out"){
        nowTrackingBalls=nowTrackingBalls+"stumping,"
        type="It is stumped.Stumping done by "+filderName+"."
      }else if(outType=="hit-wicket"){
        nowTrackingBalls=nowTrackingBalls+"hitOut,"
        type="It is unfortunately Hit-Wicket."
      }

      let comment=String(overNumber)+"."+String(ballNumber)+" "+bowlerName+" to "+batsmanName+" , OUT."+type
      let commentry={
        comment:comment,
        commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
      ballsTracking=ballsTracking+" out"
      let out=true
      let time=new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
        
          $set: {
            [bowlerWicketPosition]:bowlerWickets,
            [bowlerBallsTrackingPosition]:nowTrackingBalls,
            [inningsBallTrackingPosition]:inningsBallTracking
          
          }
        }
      )
      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            [batsmanBallsPosition]:nowBalls,
            [batsmanOutByPosition]:bowlerName,
            [batsmanIsOutPosition]:out,
            [batsmanOutTypePosition]:outType,
            [batsmanOutFilderNamePosition]:filderName,
            [batsmanFinishedTimeAtPosition]:time,
            [batsmanBallsTrackingPosition]:ballsTracking,
          }
        }
      )
      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            "liveScore.totalWickets":totalWickets,
            "liveScore.partnershipRuns":0,
            "liveScore.partnershipBalls":0,
            "eachOver.ballNumber":ballNumber,
            "state.wicketFallen":true ,
            "liveScore.lastWicketDetails":lastWicketDetails
          },
          $push:{
            [innings]:outPosition,
            "matchDetails.commentry":commentry
          }
        }
      )
      
      resolve()
    } catch {
      this.errors.push("There is some problem on generalOut function.")
      reject(this.errors)
    }
  })
}


Calculation.prototype.eachBallCommentry=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     let strikerIndex=roomData.state.strikerIndex
     let bowlerIndex=roomData.state.bowlerIndex
     let overs=roomData.liveScore.totalOvers
     let ballNumber=roomData.eachOver.ballNumber
      let batsmanName
      let bowlerName
      let inningsBallTrackingPosition
      let inningsBallTracking
      if (roomData.matchDetails.inningsStatus=="1st Innings"){
        batsmanName=roomData.firstInningsBatting.allBatsman[strikerIndex].name
        bowlerName=roomData.firstInningsBowling.allBowlers[bowlerIndex].name
        inningsBallTrackingPosition="firstInningsBallTracking.balls"
        inningsBallTracking=roomData.firstInningsBallTracking.balls
     
      }else if(roomData.matchDetails.inningsStatus=="2nd Innings"){
        batsmanName=roomData.secondInningsBatting.allBatsman[strikerIndex].name
        bowlerName=roomData.secondInningsBowling.allBowlers[bowlerIndex].name
        inningsBallTrackingPosition="secondInningsBallTracking.balls"
        inningsBallTracking=roomData.secondInningsBallTracking.balls
     
      }
      
    let commentFirstPart=String(overs)+"."+String(ballNumber)+" "+bowlerName+" to "+batsmanName+", "
    let commentSecondPart 
    if(this.data.ballType=="ok"){
      inningsBallTracking=inningsBallTracking+String(this.data.run)+","
       if(this.data.run>1){
        commentSecondPart=String(this.data.run)+" runs."
       }else{
        commentSecondPart=String(this.data.run)+" run."
       }
     }else if(this.data.ballType=="wideBall"){
      inningsBallTracking=inningsBallTracking+String(this.data.run)+"wd,"
      
      if(this.data.run>1){
        commentSecondPart=String(this.data.run)+" runs + Wide Ball."
       }else{
        commentSecondPart=String(this.data.run)+" runs + Wide Ball."
       }
     }else if(this.data.ballType=="byeRun"){
      inningsBallTracking=inningsBallTracking+String(this.data.run)+"b,"
      
      if(this.data.run>1){
        commentSecondPart=String(this.data.run)+" Bye Runs."
       }else{
        commentSecondPart=String(this.data.run)+" Bye Run."
       }
     }else if(this.data.ballType=="legByeRun"){
      inningsBallTracking=inningsBallTracking+String(this.data.run)+"lb,"
      
      if(this.data.run>1){
        commentSecondPart=String(this.data.run)+" Leg-bye Runs."
       }else{
        commentSecondPart=String(this.data.run)+" Leg-bye Run."
       }
     }else if(this.data.ballType=="noBallRunBat"){
      inningsBallTracking=inningsBallTracking+String(this.data.run)+"nb,"
      
      if(this.data.run>1){
        commentSecondPart=String(this.data.run)+" Runs + No Ball."
       }else{
        commentSecondPart=String(this.data.run)+" Run + No Ball."
       }
     }else if(this.data.ballType=="noBallRunBye"){
      inningsBallTracking=inningsBallTracking+String(this.data.run)+"b+nb,"
      
      if(this.data.run>1){
        commentSecondPart=String(this.data.run)+" Bye Runs + No Ball."
       }else{
        commentSecondPart=String(this.data.run)+" Bye Run + No Ball."
       }
     }else if(this.data.ballType=="noBallRunLegBye"){
      inningsBallTracking=inningsBallTracking+String(this.data.run)+"lb+nb,"
      
      if(this.data.run>1){
        commentSecondPart=String(this.data.run)+" Leg-bye Runs + No Ball."
       }else{
        commentSecondPart=String(this.data.run)+" Leg-bye Run + No Ball."
       }
     }

    let commentry={
      comment:commentFirstPart+commentSecondPart,
      commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }

    await liveRoomCollection.findOneAndUpdate(
      { matchId: matchId },
      {
        $set: {
          [inningsBallTrackingPosition]: inningsBallTracking
        },
        $push: {
          "matchDetails.commentry": commentry
        }
      }
    )
    
    resolve()
    } catch {
      this.errors.push("There is some problem on comments function.")
      reject(this.errors)
    }
  })
}

Calculation.prototype.addPaneltyRuns=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof this.data.paneltyRuns != "string") {
        reject()
      }else{
        let panelty=Number(this.data.paneltyRuns)
        let roomData=await liveRoomCollection.findOne({matchId:matchId})
        let totalRuns=roomData.liveScore.totalRuns
        let paneltyRuns=roomData.extras.paneltyRuns
        let nowTotalRuns=totalRuns+panelty
        let nowPaneltyRuns=paneltyRuns+panelty
        let commentry={
          comment:String(panelty)+" Panelty Runs added on total score.Panelty done by "+this.data.paneltyBy+".",
          commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
        }
        await liveRoomCollection.findOneAndUpdate(
          { matchId: matchId },
          {
            $set: {
              "liveScore.totalRuns":nowTotalRuns,
              "extras.paneltyRuns":nowPaneltyRuns
            },
            $push: {
              "matchDetails.commentry": commentry
            }
          }
        )
        await this.inningsStatusCheck(matchId)
        resolve()
      }
    
    } catch {
      this.errors.push("There is some problem on addPaneltyRuns function.")
      reject(this.errors)
    }
  })
}






Calculation.gotRetiredHurt=function(matchId){
  return new Promise(async (resolve, reject) => {
    try {
     
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     
     let strikerBatsmanIndex=roomData.state.strikerIndex
     let IndexBatsman=String(strikerBatsmanIndex)
     let ballNumber=roomData.eachOver.ballNumber
     let overNumber=roomData.liveScore.totalOvers
     let batsmanName
     let batsmanRegNumber
     let playerDetails={}
     
     if(roomData.matchDetails.inningsStatus=="1st Innings"){
        batsmanName=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].name
        batsmanRegNumber=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].regNumber
        battingIndexNumber=strikerBatsmanIndex
        batsmanIsRetiredHurtPosition="firstInningsBatting.allBatsman."+IndexBatsman+".isRetiredHurt" 
      }else{
        batsmanName=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].name
        batsmanRegNumber=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].regNumber
        battingIndexNumber=strikerBatsmanIndex
        batsmanIsRetiredHurtPosition="secondInningsBatting.allBatsman."+IndexBatsman+".isRetiredHurt" 
      }
      playerDetails={
        userName:batsmanName,
        regNumber:batsmanRegNumber,
        battedIndex:battingIndexNumber
      }
      let comment=String(overNumber)+"."+String(ballNumber)+" "+batsmanName+" got retired-hurt."
      let commentry={
        comment:comment,
        commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }

      await liveRoomCollection.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            [batsmanIsRetiredHurtPosition]:true,
            "liveScore.partnershipRuns":0,
            "liveScore.partnershipBalls":0,
            "state.wicketFallen":true ,
          },
          $push:{
            "matchDetails.retiredHurtPlayers":playerDetails,
            "matchDetails.commentry":commentry
          }
        }
      )
      
      resolve()
    } catch {
      this.errors.push("There is some problem on generalOut function.")
      reject(this.errors)
    }
  })
}



Calculation.addRetiredHurtBatterToBat=function(matchId,battedIndex){
  return new Promise(async (resolve, reject) => {
    try {
     
     let roomData=await liveRoomCollection.findOne({matchId:matchId})
     let isRetiredHurtBatter=false
     let newRetiredHurtBatters=[]
     roomData.matchDetails.retiredHurtPlayers.forEach((player)=>{
      if(player.battedIndex==Number(battedIndex)){
        isRetiredHurtBatter=true
      }else{
        newRetiredHurtBatters.push(player)
      }
     })

     if(isRetiredHurtBatter){
      let strikerBatsmanIndex=Number(battedIndex)
      let IndexBatsman=battedIndex
      let ballNumber=roomData.eachOver.ballNumber
      let overNumber=roomData.liveScore.totalOvers
      let batsmanName
      
      if(roomData.matchDetails.inningsStatus=="1st Innings"){
         batsmanName=roomData.firstInningsBatting.allBatsman[strikerBatsmanIndex].name
         batsmanIsRetiredHurtPosition="firstInningsBatting.allBatsman."+IndexBatsman+".isRetiredHurt" 
       }else{
         batsmanName=roomData.secondInningsBatting.allBatsman[strikerBatsmanIndex].name
         batsmanIsRetiredHurtPosition="secondInningsBatting.allBatsman."+IndexBatsman+".isRetiredHurt" 
       }
      
       let comment=String(overNumber)+"."+String(ballNumber)+" "+batsmanName+" comes to bat again."
       let commentry={
         comment:comment,
         commentAt:new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
       }
 
       await liveRoomCollection.findOneAndUpdate(
         { matchId: matchId },
         {
           $set: {
             [batsmanIsRetiredHurtPosition]:false,
             "matchDetails.retiredHurtPlayers":newRetiredHurtBatters,
             "state.strikerIndex": strikerBatsmanIndex,
             "state.wicketFallen":false
           },
           $push:{
             "matchDetails.commentry":commentry
           }
         }
       )
       resolve()
     }else{
       reject("Batter does not belongs to retired-hurt category!")
     }
     
    } catch {
      this.errors.push("There is some problem on generalOut function.")
      reject(this.errors)
    }
  })
}

module.exports =Calculation

