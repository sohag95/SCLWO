const performanceTableCollection = require("../db").db().collection("performanceTable")
const completedMatchesCollection = require("../db").db().collection("CompletedMatches")
const tournamentCollection = require("../db").db().collection("Tournaments")
const administrationCollection = require("../db").db().collection("administration")

const ObjectId = require('mongodb').ObjectId


let UpdatePlayerScore=function(bodyData,matchDetails){
  this.bodyData=bodyData
  this.battingData=JSON.parse(this.bodyData.battingData)
  this.bowlingData=JSON.parse(this.bodyData.bowlingData)
  this.matchData=JSON.parse(this.bodyData.matchData)
  this.matchDetails=matchDetails
  this.errors=[]
  this.previousPerformance
  this.batterName
  this.batterRegNumber
  this.bowlingName
  this.bowlingRegNumber
 }
 
 UpdatePlayerScore.prototype.checkPlayerExistsOrNot=function(){
  return new Promise(async(resolve,reject)=>{
    try{
      this.previousPerformance=await performanceTableCollection.findOne({regNumber:this.bodyData.regNumber})
      console.log(this.previousPerformance)
      if(this.previousPerformance){
        this.previousPerformance.matchDetails.forEach((match)=>{
          if(match.matchData.matchId==this.matchDetails.matchId){
            this.errors.push("Player's score for this match has already been updated.")
          }
        })
      }else{
        this.errors.push("Sorry,player's registration number is not exists.Check the registration number.")
      }
      resolve()
    }catch{
      this.errors.push("There is some problem on checking player's existence.")
      reject()
    }
  })
 }

 UpdatePlayerScore.prototype.checkGivenDataCorrectOrNot=function(){  
  if(this.battingData!=null){
    let battingIndex=Number(this.bodyData.battingIndex)
    let battingScore
      if(this.bodyData.battingInningsPosition=="firstInningsBatting"){
        battingScore=this.matchDetails.firstInningsBatting.allBatsman[battingIndex]
      }else{
        battingScore=this.matchDetails.secondInningsBatting.allBatsman[battingIndex]
      }
      
      //taking batters out type
      this.batterName=battingScore.name
      this.batterRegNumber=battingScore.regNumber

      this.battingData.outType=battingScore.outType
      if((battingScore.runs!=this.battingData.runs)||
        (battingScore.balls!=this.battingData.balls)||
        (battingScore.fours!=this.battingData.fours)||
        (battingScore.sixes!=this.battingData.sixes)||
        (battingScore.isOut!=this.battingData.isOut)){
          this.errors.push("Sorry,can't upload data!!.Batting score modification ditected!!")
      }
  }

  if(this.bowlingData!=null){
    let bowlingIndex=Number(this.bodyData.bowlingIndex)
    let bowlingScore
      if(this.bodyData.bowlingInningsPosition=="firstInningsBowling"){
        bowlingScore=this.matchDetails.firstInningsBowling.allBowlers[bowlingIndex]
      }else{
        bowlingScore=this.matchDetails.secondInningsBowling.allBowlers[bowlingIndex]
      }
      this.bowlerName=bowlingScore.name
      this.bowlerRegNumber=bowlingScore.regNumber

      if((bowlingScore.runs!=this.bowlingData.runs)||
      (bowlingScore.wickets!=this.bowlingData.wickets)||
      (bowlingScore.overs!=this.bowlingData.overs)||
      (bowlingScore.madenOvers!=this.bowlingData.madenOvers)||
      (bowlingScore.wideBalls!=this.bowlingData.wideBalls)||
      (bowlingScore.noBalls!=this.bowlingData.noBalls)){
        this.errors.push("Sorry,can't upload data!!.Bowling score modification ditected!!")
      }
  }
 }

 UpdatePlayerScore.prototype.puttingRegNumberOnMatchData=function(){
  return new Promise(async(resolve,reject)=>{
    try{
      let teamListRegNoPosition
      let battingInningsRegNoPosition
      let bowlingInningsRegNoPosition
      //update  registration number on team list
        if(this.bodyData.team=="firstTeam"){
          teamListRegNoPosition="matchDetails.firstTeamTeamList."+this.bodyData.teamMemberIndex+".regNumber"
        }else{
          teamListRegNoPosition="matchDetails.secondTeamTeamList."+this.bodyData.teamMemberIndex+".regNumber"
        }
        await completedMatchesCollection.findOneAndUpdate({matchId:this.matchDetails.matchId},{
          $set:{
            [teamListRegNoPosition]:this.bodyData.regNumber
          }
        })
      //batting position reg no update
        if(this.battingData!=null){
          if(this.bodyData.battingInningsPosition=="firstInningsBatting"){
            battingInningsRegNoPosition="firstInningsBatting.allBatsman."+this.bodyData.battingIndex+".regNumber"
          }else{
            battingInningsRegNoPosition="secondInningsBatting.allBatsman."+this.bodyData.battingIndex+".regNumber"
          }
          await completedMatchesCollection.findOneAndUpdate({matchId:this.matchDetails.matchId},{
            $set:{
              [battingInningsRegNoPosition]:this.bodyData.regNumber
            }
          })
        }
      //bowling position reg no update
        if(this.bowlingData!=null){
          if(this.bodyData.bowlingInningsPosition=="firstInningsBowling"){
            bowlingInningsRegNoPosition="firstInningsBowling.allBowlers."+this.bodyData.bowlingIndex+".regNumber"
          }else{
            bowlingInningsRegNoPosition="secondInningsBowling.allBowlers."+this.bodyData.bowlingIndex+".regNumber"
          }
          await completedMatchesCollection.findOneAndUpdate({matchId:this.matchDetails.matchId},{
            $set:{
              [bowlingInningsRegNoPosition]:this.bodyData.regNumber
            }
          })
        }
      resolve()
    }catch{
      this.errors.push("There is some problem on puttingRegNumberOnMatchData function.")
      reject()
    }
  })
 }

 UpdatePlayerScore.prototype.markTheRegNumberAsEntered=function(){
  return new Promise(async(resolve,reject)=>{
    try{
      let regNumberStoredPlace
      if(this.bodyData.team=="firstTeam"){
        regNumberStoredPlace="firstTeamScoreEnteredRegNumbers"
      }else{
        regNumberStoredPlace="secondTeamScoreEnteredRegNumbers"
      }
      await completedMatchesCollection.findOneAndUpdate({matchId:this.matchDetails.matchId},{
        $push:{
          [regNumberStoredPlace]:this.bodyData.regNumber
        }
      })
      resolve()
    }catch{
      this.errors.push("There is some problem on puttingRegNumberOnMatchData function.")
      reject()
    }
  })
 }


UpdatePlayerScore.prototype.updateScoreOnPlayerPreformanceTable=function(){
  return new Promise(async(resolve,reject)=>{
    try{
      let matches=this.previousPerformance.matches
      let battingPerformance=this.previousPerformance.batting
      let bowlingPerformance=this.previousPerformance.bowling
      let newBattingPerformance=this.previousPerformance.batting
      let newBowlingPerformance=this.previousPerformance.bowling

      if(this.battingData!=null){
        newBattingPerformance.innings=battingPerformance.innings+1
        newBattingPerformance.runs=battingPerformance.runs+this.battingData.runs
        newBattingPerformance.balls=battingPerformance.balls+this.battingData.balls
        newBattingPerformance.sixes=battingPerformance.sixes+this.battingData.sixes
        newBattingPerformance.fours=battingPerformance.fours+this.battingData.fours
        if(!this.battingData.isOut){
          newBattingPerformance.notOut=battingPerformance.notOut+1
        }
        if(this.battingData.runs>=50 && this.battingData.runs<100){
          newBattingPerformance.fifties=battingPerformance.fifties+1
        }
        if(this.battingData.runs>=100){
          newBattingPerformance.hundreds=battingPerformance.hundreds+1
        }
        if(battingPerformance.hightRun.runs<=this.battingData.runs && this.battingData.runs!=0){
          newBattingPerformance.hightRun.runs=this.battingData.runs
          newBattingPerformance.hightRun.balls=this.battingData.balls
          newBattingPerformance.hightRun.matchId=this.matchDetails.matchId
        }
      }
      
      if(this.bowlingData!=null){
        newBowlingPerformance.innings=bowlingPerformance.innings+1
        newBowlingPerformance.runs=bowlingPerformance.runs+this.bowlingData.runs
        newBowlingPerformance.overs=bowlingPerformance.overs+this.bowlingData.overs
        newBowlingPerformance.wickets=bowlingPerformance.wickets+this.bowlingData.wickets
        newBowlingPerformance.madenOvers=bowlingPerformance.madenOvers+this.bowlingData.madenOvers
        newBowlingPerformance.wideBalls=bowlingPerformance.wideBalls+this.bowlingData.wideBalls
        newBowlingPerformance.noBalls=bowlingPerformance.noBalls+this.bowlingData.noBalls
        if(this.bowlingData.wickets>=5){
          newBowlingPerformance.fiveWickets=bowlingPerformance+1
        }
        if(bowlingPerformance.hightWicket.wickets<=this.bowlingData.wickets && this.bowlingData.wickets!=0){
          newBowlingPerformance.hightWicket.wickets=this.bowlingData.wickets
          newBowlingPerformance.hightWicket.matchId=this.matchDetails.matchId
        }
      }
      let detailsData={
        matchData:this.matchData,
        battingData:this.battingData,
        bowlingData:this.bowlingData
      }
      await performanceTableCollection.findOneAndUpdate({regNumber:this.previousPerformance.regNumber},{
        $set:{
          "matches":matches+1,
          "batting":newBattingPerformance,
          "bowling":newBowlingPerformance
        },
        $push:{
          "matchDetails":detailsData
        }
      })
     resolve()
    }catch{
      this.errors.push("There is some problem on updateScoreOnPlayerPreformanceTable function.")
      reject(this.errors)
    }
  })
 }

UpdatePlayerScore.prototype.bestBattersAndBowlersUpdationOnTournament=function(){
return new Promise(async(resolve,reject)=>{
    try{
      let tournamentData=await tournamentCollection.findOne({tournamentName:this.matchDetails.matchDetails.tournamentName,tournamentYear:this.matchDetails.matchDetails.tournamentYear})
      let topBatters=tournamentData.topBatters
      let topBowlers=tournamentData.topBowlers

      //taking player's scores for the particular tournament
      let tillNowScoredRuns=0
      let tillNowTakenWickets=0
      let totalMatches=0
      this.previousPerformance.matchDetails.forEach((match)=>{
        if((match.matchData.tournamentName==this.matchDetails.matchDetails.tournamentName) && (match.matchData.tournamentYear==this.matchDetails.matchDetails.tournamentYear)){
          if(match.battingData!=null){
            tillNowScoredRuns=tillNowScoredRuns+match.battingData.runs
          }
          if(match.bowlingData!=null){
            tillNowTakenWickets=tillNowTakenWickets+match.bowlingData.wickets
          }
          totalMatches+=1
        }
      })

      let updatedTopBattersArray=topBatters
      let updatedTopBowlersArray=topBowlers

      if(this.battingData!=null){
        let batterData={
          userName:this.batterName,
          regNumber:this.batterRegNumber,
          runs:tillNowScoredRuns+this.battingData.runs,
          matchesPlayed:totalMatches+1
         }
         let batterPresent=false
         topBatters.forEach((batter,index)=>{
          if(batter.regNumber==this.batterRegNumber){
            batterPresent=true
            topBatters[index]=batterData
          }
        })
        if(!batterPresent){
          topBatters.push(batterData)
        }
        topBatters.sort((a, b) => {
          return b.runs - a.runs;
        });
        updatedTopBattersArray=topBatters.slice(0,10)
      }

      if(this.bowlingData!=null){
        //arrange bowler all needed data
        let bowlerData={
        userName:this.bowlerName,
        regNumber:this.bowlerRegNumber,
        wickets:tillNowTakenWickets+this.bowlingData.wickets,
        matchesPlayed:totalMatches+1
        }
        let bowlerPresent=false 
        topBowlers.forEach((bowler,index)=>{
          if(bowler.regNumber==this.bowlerRegNumber){
            bowlerPresent=true
            topBowlers[index]=bowlerData
          }
        })
        if(!bowlerPresent){
          topBowlers.push(bowlerData)
        }
        topBowlers.sort((a, b) => {
          return b.wickets - a.wickets;
        });
        updatedTopBowlersArray=topBowlers.slice(0,10)
      }
      //update new data on DB after calculation
      await tournamentCollection.findOneAndUpdate({_id:ObjectId(tournamentData._id)},{
        $set:{
          "topBatters":updatedTopBattersArray,
          "topBowlers":updatedTopBowlersArray
        }
      })
     resolve()
    }catch{
      this.errors.push("There is some problem on top batter and bowler arrangement function!")
      reject()
    }
  })
}



UpdatePlayerScore.prototype.bestBattersAndBowlersUpdationOnSiliguriTop10=function(){
  return new Promise(async(resolve,reject)=>{
      try{
        let topPlayersData=await administrationCollection.findOne({regNumber:"siliguriTop10Players"})
        let topBatters=topPlayersData.topBatters
        let topBowlers=topPlayersData.topBowlers
        let topAllRounders=topPlayersData.topAllRounders
  
        //taking player's scores for the particular tournament
        let tillNowScoredRuns=0
        let tillNowTakenWickets=0
        let totalMatches=0
        
        
       
        this.previousPerformance.matchDetails.forEach((match)=>{
           if(match.battingData!=null){
              tillNowScoredRuns=tillNowScoredRuns+match.battingData.runs
            }
            if(match.bowlingData!=null){
              tillNowTakenWickets=tillNowTakenWickets+match.bowlingData.wickets
            }
            totalMatches+=1
        })
        
        let updatedTopBattersArray=topBatters
        let updatedTopBowlersArray=topBowlers
        let updatedTopAllRoundersArray=topAllRounders
        let thisMatchRuns=0
        let thisMatchWickets=0
        let allRounderName=null
        let allRounderRegNumber=null
        
  
        if(this.battingData!=null){
          thisMatchRuns=this.battingData.runs
          allRounderName=this.batterName
          allRounderRegNumber=this.batterRegNumber
          let batterData={
            userName:this.batterName,
            regNumber:this.batterRegNumber,
            runs:tillNowScoredRuns+this.battingData.runs,
            matchesPlayed:totalMatches+1
           }
           let batterPresent=false
           topBatters.forEach((batter,index)=>{
            if(batter.regNumber==this.batterRegNumber){
              batterPresent=true
              topBatters[index]=batterData
            }
          })
          if(!batterPresent){
            topBatters.push(batterData)
          }
          topBatters.sort((a, b) => {
            return b.runs - a.runs;
          });
          updatedTopBattersArray=topBatters.slice(0,10)
        }
  
        if(this.bowlingData!=null){
          thisMatchWickets=this.bowlingData.wickets
          allRounderName=this.bowlerName
          allRounderRegNumber=this.bowlerRegNumber
          //arrange bowler all needed data
          let bowlerData={
          userName:this.bowlerName,
          regNumber:this.bowlerRegNumber,
          wickets:tillNowTakenWickets+this.bowlingData.wickets,
          matchesPlayed:totalMatches+1
          }
          let bowlerPresent=false 
          topBowlers.forEach((bowler,index)=>{
            if(bowler.regNumber==this.bowlerRegNumber){
              bowlerPresent=true
              topBowlers[index]=bowlerData
            }
          })
          if(!bowlerPresent){
            topBowlers.push(bowlerData)
          }
          topBowlers.sort((a, b) => {
            return b.wickets - a.wickets;
          });
          updatedTopBowlersArray=topBowlers.slice(0,10)
        }
        //have to work on all rounders data updation
         //1 run = 1 point
        //1 wicket = 20 points
        if(allRounderName && (tillNowTakenWickets+thisMatchWickets) && (tillNowScoredRuns+thisMatchRuns)){
          let allRounderData={
            userName:allRounderName,
            regNumber:allRounderRegNumber,
            runs:tillNowScoredRuns+thisMatchRuns,
            wickets:tillNowTakenWickets+thisMatchWickets,
            allRoundPoints:tillNowScoredRuns+thisMatchRuns+((tillNowTakenWickets+thisMatchWickets)*20)
          }
          let allRounderPresent=false 
            topAllRounders.forEach((allRounder,index)=>{
              if(allRounder.regNumber==allRounderRegNumber){
                allRounderPresent=true
                topAllRounders[index]=allRounderData
              }
            })
            if(!allRounderPresent){
              topAllRounders.push(allRounderData)
            }
            topAllRounders.sort((a, b) => {
              return b.allRoundPoints - a.allRoundPoints;
            });
            updatedTopAllRoundersArray=topAllRounders.slice(0,10)
          }
        //update new data on DB after calculation
        await administrationCollection.findOneAndUpdate({_id:ObjectId(topPlayersData._id)},{
          $set:{
            "topBatters":updatedTopBattersArray,
            "topBowlers":updatedTopBowlersArray,
            "topAllRounders":updatedTopAllRoundersArray
          }
        })
       resolve()
      }catch{
        this.errors.push("There is some problem on top batter and bowler in siliguri function!")
        reject()
      }
    })
  }
  

 UpdatePlayerScore.prototype.updateScore=function(){
  return new Promise(async(resolve,reject)=>{
    try{
      await this.checkPlayerExistsOrNot()
      this.checkGivenDataCorrectOrNot()
      if(!this.errors.length){
        if(this.bodyData.regNumberInMatch=="Not registered"){
          await this.puttingRegNumberOnMatchData()
        }
        await this.updateScoreOnPlayerPreformanceTable()
        await this.markTheRegNumberAsEntered()
        await this.bestBattersAndBowlersUpdationOnTournament()
        await this.bestBattersAndBowlersUpdationOnSiliguriTop10()
        console.log("This line has executed2")
        resolve("success")
      }else{
        reject(this.errors)
      }
    }catch{
      console.log("That line has executed")
      reject(this.errors)
    }
  })
 }
 
 module.exports=UpdatePlayerScore