const performanceTableCollection = require("../db").db().collection("performanceTable")


let PracticeMatch = function (data,regNumber) {
  if(data){
    this.matchData = data.matchData
    this.battingData = data.battingData
    this.bowlingData = data.bowlingData
  }
  this.regNumber=regNumber
  this.errors = []
  this.practiceMatchBattingData
  this.practiceMatchBowlingData
  this.practiceMatches
  this.matchDetails
  this.newPracticeMatchesDetails=[]
}

PracticeMatch.prototype.cleanUp = function () {
  if (typeof this.matchData.ownTeam != "string") {
    this.matchData.ownTeam = ""
  }
  if (typeof this.matchData.opponentTeam != "string") {
    this.matchData.opponentTeam = ""
  }
  if (typeof this.matchData.venue != "string") {
    this.matchData.venue = ""
  }
  if (typeof this.matchData.date!= "string") {
    this.matchData.date= ""
  }
  this.matchData = {
    ownTeam:this.matchData.ownTeam,
    opponentTeam:this.matchData.opponentTeam,
    venue:this.matchData.venue,
    date:this.matchData.date,
    shortDetails:this.matchData.shortDetails
  }
  if(this.battingData){
    if (typeof this.battingData.runs != "string") {
      this.battingData.runs = null
    }
    if (typeof this.battingData.balls != "string") {
      this.battingData.balls = null
    }
    if (typeof this.battingData.fours != "string") {
      this.battingData.fours = null
    }
    if (typeof this.battingData.sixes!= "string") {
      this.battingData.sixes= null
    }
    if (typeof this.battingData.outType!= "string") {
      this.battingData.outType= "not-out"
    }
    this.battingData = {
      runs:Number(this.battingData.runs),
      balls:Number(this.battingData.balls),
      fours:Number(this.battingData.fours),
      sixes:Number(this.battingData.sixes),
      outType:this.battingData.outType
    }
    if (this.battingData.runs == null) {this.battingData.runs = 0}
    if (this.battingData.balls == null) {this.battingData.balls = 0}
    if (this.battingData.fours == null) {this.battingData.fours = 0}
    if (this.battingData.sixes== null) {this.battingData.sixes= 0}
  }
  if(this.bowlingData){
    if (typeof this.bowlingData.runs != "string") {
      this.bowlingData.runs = null
    }
    if (typeof this.bowlingData.overs != "string") {
      this.bowlingData.overs = null
    }
    if (typeof this.bowlingData.wickets != "string") {
      this.bowlingData.wickets = null
    }
    if (typeof this.bowlingData.madenOvers != "string") {
      this.bowlingData.madenOvers = null
    }
    if (typeof this.bowlingData.wideBalls != "string") {
      this.bowlingData.wideBalls = 0
    }
    if (typeof this.bowlingData.noBalls != "string") {
      this.bowlingData.noBalls = 0
    }
    this.bowlingData = {
      runs:Number(this.bowlingData.runs),
      overs:Number(this.bowlingData.overs),
      wickets:Number(this.bowlingData.wickets),
      madenOvers:Number(this.bowlingData.madenOvers),
      wideBalls:Number(this.bowlingData.wideBalls),
      noBalls:Number(this.bowlingData.noBalls)
    }
    //in case of any unnecessary data will be considered as zero.
    if (this.bowlingData.runs == null) {this.bowlingData.runs = 0}
    if (this.bowlingData.overs == null) {this.bowlingData.overs = 0}
    if (this.bowlingData.wickets == null) {this.bowlingData.wickets = 0}
    if (this.bowlingData.madenOvers == null) {this.bowlingData.madenOvers = 0}  
  }

  this.matchDetails={
    matchData:this.matchData,
    battingData:this.battingData,
    bowlingData:this.bowlingData
  }
  console.log("I executed")
  console.log(this.matchDetails)
}

PracticeMatch.prototype.validate = function () {
  if(this.battingData){
    //batting data validation check
    if (this.battingData.balls == 0 && this.battingData.runs > 0) {
      this.errors.push("Runs can't be scored without playing a single ball.")
    }
    if (this.battingData.fours * 4 + this.battingData.sixes * 6 > this.battingData.runs) {
      this.errors.push("Total Scored runs can not less then total runs of all hitted 4's and 6's.")
    }
    if (this.battingData.fours + this.battingData.sixes > this.battingData.balls) {
      this.errors.push("Total number of hitting 4's and 6's can't greater than total balls you had fatched.")
    }
  }

  if(this.bowlingData){
    //bowling data validation check
    if (this.bowlingData.overs == 0 && this.bowlingData.wickets > 0) {
      this.errors.push("Without bowling a single over you can't get wickets.")
    }
    if (this.bowlingData.overs == 0 && this.bowlingData.givenRuns > 0) {
      this.errors.push("Without bowling a single over you can't give runs.")
    }
    if (this.bowlingData.overs == 0 && this.bowlingData.madenOvers > 0) {
      this.errors.push("Without bowling a single over you can't get maden overs.")
    }
    if (this.bowlingData.wickets >10 ) {
      this.errors.push("You can not get more then 10 wickets.")
    }
  }
  console.log("I executed tooo")
}

PracticeMatch.prototype.getPreviousPracticeMatchData = function () {
  return new Promise(async(resolve, reject) => {
    try {
      let performanceTable=await performanceTableCollection.findOne({regNumber:this.regNumber})
      this.practiceMatchBattingData=performanceTable.practiceMatchBatting
      this.practiceMatchBowlingData=performanceTable.practiceMatchBowling
      this.practiceMatches=performanceTable.practiceMatches+1
      //batting details adding
      if(this.battingData){
        if (this.battingData.balls > 0) {
          this.practiceMatchBattingData.innings = this.practiceMatchBattingData.innings + 1
        }
        if (this.practiceMatchBattingData.hightRuns < this.battingData.runs) {
          this.practiceMatchBattingData.hightRuns = this.battingData.runs
        }
        this.practiceMatchBattingData.runs = this.practiceMatchBattingData.runs + this.battingData.runs
        this.practiceMatchBattingData.balls = this.practiceMatchBattingData.balls + this.battingData.balls
        this.practiceMatchBattingData.fours = this.practiceMatchBattingData.fours + this.battingData.fours
        this.practiceMatchBattingData.sixes = this.practiceMatchBattingData.sixes + this.battingData.sixes
        
        if (this.battingData.runs >= 50 && this.battingData.runs < 100) {
          this.practiceMatchBattingData.fifties = this.practiceMatchBattingData.fifties + 1
        }
        if (this.battingData.runs >= 100) {
          this.practiceMatchBattingData.hundreds = this.practiceMatchBattingData.hundreds + 1
        }
        if (this.battingData.outType == "not-out") {
          this.practiceMatchBattingData.notOut = this.practiceMatchBattingData.notOut + 1
        }
      }

      if(this.bowlingData){
      //bowling details adding
        if (this.bowlingData.overs > 0) {
          this.practiceMatchBowlingData.innings = this.practiceMatchBowlingData.innings + 1
        }
        this.practiceMatchBowlingData.overs = this.practiceMatchBowlingData.overs + this.bowlingData.overs
        this.practiceMatchBowlingData.runs = this.practiceMatchBowlingData.runs + this.bowlingData.runs
        this.practiceMatchBowlingData.madenOvers = this.practiceMatchBowlingData.madenOvers + this.bowlingData.madenOvers
        this.practiceMatchBowlingData.wickets = this.practiceMatchBowlingData.wickets + this.bowlingData.wickets
        this.practiceMatchBowlingData.wideBalls = this.practiceMatchBowlingData.wideBalls + this.bowlingData.wideBalls
        this.practiceMatchBowlingData.noBalls = this.practiceMatchBowlingData.noBalls + this.bowlingData.noBalls

        if (this.bowlingData.wickets >= 5 && this.bowlingData.wickets <= 10) {
          this.practiceMatchBowlingData.fiveWickets = this.practiceMatchBowlingData.fiveWickets + 1
        }
        
        if (this.practiceMatchBowlingData.hightWickets < this.bowlingData.wickets) {
          this.practiceMatchBowlingData.hightWickets = this.bowlingData.wickets
        }
      }
      console.log("I also executed")
      resolve()
    } catch {
      this.errors.push("Problem created on getPreviousPracticeMatchData function.")
      reject()
    }
  })
}

PracticeMatch.prototype.addPracticeMatchData = function () {
  return new Promise(async(resolve, reject) => {
    try {
      this.cleanUp()
      this.validate()
      if(!this.errors.length){
        await this.getPreviousPracticeMatchData()
        await performanceTableCollection.findOneAndUpdate({regNumber:this.regNumber},{
          $set:{
            "practiceMatches":this.practiceMatches,
            "practiceMatchBatting":this.practiceMatchBattingData,
            "practiceMatchBowling":this.practiceMatchBowlingData
          },
          $push:{
            "practiceMatchDetails":this.matchDetails
          }
        })
        resolve()
      }else{
        reject(this.errors)
      }
    } catch {
      reject(["There is some problem.Try again later!"])
    }
  })
}



PracticeMatch.prototype.getReadyToDeleteMatchDetails = function (matchIndex) {
  return new Promise(async(resolve, reject) => {
    try {
      let performanceTable=await performanceTableCollection.findOne({regNumber:this.regNumber})
      this.practiceMatchBattingData=performanceTable.practiceMatchBatting
      this.practiceMatchBowlingData=performanceTable.practiceMatchBowling
      this.practiceMatches=performanceTable.practiceMatches-1
      let matchPresent=false
      if((performanceTable.practiceMatchDetails.length>=matchIndex) && (matchIndex>=0)){
        matchPresent=true
      }
      if(matchPresent){
        let hightRuns=0
        let hightWickets=0
        
        performanceTable.practiceMatchDetails.forEach((match,index)=>{
          if(index!=matchIndex){
            if(match.battingData){
              if(match.battingData.runs>hightRuns){
                hightRuns=match.battingData.runs
              }
            }
            if(match.bowlingData){
              if(match.bowlingData.wickets>hightWickets){
                hightWickets=match.bowlingData.wickets
              }
            }
            this.newPracticeMatchesDetails.push(match)
          }
        })
      //batting details adding
      let deletedBattingData=performanceTable.practiceMatchDetails[matchIndex].battingData
      if(deletedBattingData){
          this.practiceMatchBattingData.innings = this.practiceMatchBattingData.innings - 1
          this.practiceMatchBattingData.hightRuns = hightRuns
        
        this.practiceMatchBattingData.runs = this.practiceMatchBattingData.runs - deletedBattingData.runs
        this.practiceMatchBattingData.balls = this.practiceMatchBattingData.balls - deletedBattingData.balls
        this.practiceMatchBattingData.fours = this.practiceMatchBattingData.fours - deletedBattingData.fours
        this.practiceMatchBattingData.sixes = this.practiceMatchBattingData.sixes - deletedBattingData.sixes
        
        if (deletedBattingData.runs >= 50 && deletedBattingData.runs < 100) {
          this.practiceMatchBattingData.fifties = this.practiceMatchBattingData.fifties - 1
        }
        if (deletedBattingData.runs >= 100) {
          this.practiceMatchBattingData.hundreds = this.practiceMatchBattingData.hundreds - 1
        }
        if (deletedBattingData.outType == "not-out") {
          this.practiceMatchBattingData.notOut = this.practiceMatchBattingData.notOut - 1
        }
      }
      let deletedBowlingData=performanceTable.practiceMatchDetails[matchIndex].bowlingData
      if(deletedBowlingData){
      //bowling details adding
        this.practiceMatchBowlingData.hightWickets = hightWickets
        this.practiceMatchBowlingData.innings = this.practiceMatchBowlingData.innings - 1
        this.practiceMatchBowlingData.overs = this.practiceMatchBowlingData.overs - deletedBowlingData.overs
        this.practiceMatchBowlingData.runs = this.practiceMatchBowlingData.runs - deletedBowlingData.runs
        this.practiceMatchBowlingData.madenOvers = this.practiceMatchBowlingData.madenOvers - deletedBowlingData.madenOvers
        this.practiceMatchBowlingData.wickets = this.practiceMatchBowlingData.wickets - deletedBowlingData.wickets
        this.practiceMatchBowlingData.wideBalls = this.practiceMatchBowlingData.wideBalls - deletedBowlingData.wideBalls
        this.practiceMatchBowlingData.noBalls = this.practiceMatchBowlingData.noBalls - deletedBowlingData.noBalls

        if (deletedBowlingData.wickets >= 5 && deletedBowlingData.wickets <= 10) {
          this.practiceMatchBowlingData.fiveWickets = this.practiceMatchBowlingData.fiveWickets - 1
        }   
      }
      resolve()
    }else{
      this.errors.push("Match does not exists.")
      reject()
    }
    } catch {
      this.errors.push("Problem created on getReadyToDelete function.")
      reject()
    }
  })
}

PracticeMatch.prototype.deletePracticeMatchData = function (matchIndex) {
  return new Promise(async(resolve, reject) => {
    try {
      if(matchIndex==null){
        this.errors.push("Data manipulation ditected")
        reject(this.errors)
      }
      await this.getReadyToDeleteMatchDetails(matchIndex)
      if(!this.errors.length){
        await performanceTableCollection.findOneAndUpdate({regNumber:this.regNumber},{
          $set:{
            "practiceMatches":this.practiceMatches,
            "practiceMatchBatting":this.practiceMatchBattingData,
            "practiceMatchBowling":this.practiceMatchBowlingData,
            "practiceMatchDetails":this.newPracticeMatchesDetails
          }
        })
        resolve()
      }else{
        reject(this.errors)
      }
    } catch {
      reject(["There is some problem.Try again later!"])
    }
  })
}

module.exports = PracticeMatch