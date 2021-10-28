const playersCollection = require("../db").db().collection("players")
const performanceTableCollection = require("../db").db().collection("performanceTable")

let PerformanceTable = function (regNumber) {
  this.regNumber = regNumber
  this.tableData 
}

PerformanceTable.prototype.entry = function () {
  this.tableData = {
    regNumber: this.regNumber,
    matches: 0,
    batting: {
      innings: 0,
      runs: 0,
      balls: 0,
      sixes: 0,
      fours: 0,
      fifties: 0,
      hundreds: 0,
      hightRun:{
        runs:0,
        balls:0,
        matchId:null
      },
      notOut:0
    },
    bowling: {
      innings: 0,
      runs: 0,
      overs: 0,
      wickets: 0,
      fiveWickets: 0,
      madenOvers: 0,
      wideBalls:0,
      noBalls:0,
      hightWicket:{
        wickets:0,
        matchId:null
      }
    },
    matchDetails:[],
    practiceMatches:0,
    practiceMatchBatting: {
      innings: 0,
      runs: 0,
      balls: 0,
      sixes: 0,
      fours: 0,
      fifties: 0,
      hundreds: 0,
      hightRuns:0,
      notOut:0,
    },
    practiceMatchBowling: {
      innings: 0,
      runs: 0,
      overs: 0,
      wickets: 0,
      fiveWickets: 0,
      madenOvers: 0,
      wideBalls:0,
      noBalls:0,
      hightWickets:0
    },
    practiceMatchDetails:[]
  }
}


PerformanceTable.prototype.createTable = function () {
  return new Promise(async (resolve, reject) => {
    try {
      this.entry()
      await performanceTableCollection.insertOne(this.tableData)
      resolve()
    } catch {
      reject()
    }
  })
}
module.exports = PerformanceTable
