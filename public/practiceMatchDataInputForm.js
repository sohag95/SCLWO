let doesPlayerBatted=document.getElementById("didPlayerBatted")
let doesPlayerBowled=document.getElementById("didPlayerBowled")
let battingFormField=document.getElementById("battingDataFields")
let bowlingFormField=document.getElementById("bowlingDataFields")

let battingData=null
let bowlingData=null

let battingFormHtml=`
          <div id="batting-data-form" class="p-4">
          <h4><strong>Enter Batting Details</strong></h4>
            <div class="row">
              <div class="col-6">
                <div class="form-group">
                  <label for="scoredRuns" class="text-muted mb-1"><small>Scored Runs</small></label>
                  <input required id="scoredRuns" value="0" class="form-control" type="number" placeholder="Enter your team name" autocomplete="off" />
                </div>
              </div>
              <div class="col-6">
                <div class="form-group">
                  <label for="fatchedBalls" class="text-muted mb-1"><small>Fatched Balls</small></label>
                  <input required id="fatchedBalls" value="0" class="form-control" type="number" placeholder="Enter match number" autocomplete="off" />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-6">
                <div class="form-group">
                  <label for="fours" class="text-muted mb-1"><small>Fours</small></label>
                  <input required  id="fours" value="0" class="form-control" type="number" placeholder="Enter the ground name" autocomplete="off" />
                </div>
              </div>
              <div class="col-6">
                <div class="form-group">
                  <label for="sixes" class="text-muted mb-1"><small>Sixes</small></label>
                  <input required id="sixes" value="0" class="form-control" type="number" placeholder="Enter the played date" autocomplete="off" />
                </div>
              </div>
            </div> 
            <div class="form-group">
            <label for="outType" class="text-muted mb-1"><small>Select Your Out Type</small></label>
            <select required id="outType" class="form-control" >
              <option value="not-out">Not Out</option>
              <option value="run-out">Run Out</option>
              <option value="caught-out">Caught Out</option>
              <option value="lbw">LBW</option>
              <option value="stumping-out">Stumping Out</option>
              <option value="hit-wicket">Hit-Wicket</option>
              <option value="retired-hurt">Retired-Hurt</option>
            </select>
          </div>
          </div>
`
let bowlingFormHtml=`
          <div id="bowling-data-form" class="p-4">
          <h4><strong>Enter Bowling Details</strong></h4>
            <div class="row">
              <div class="col-6">
                <div class="form-group">
                  <label for="givenRuns" class="text-muted mb-1"><small>Given runs</small></label>
                  <input required id="givenRuns" value="0" class="form-control" type="number" placeholder="Enter given runs" autocomplete="off" />
                </div>
              </div>
              <div class="col-6">
                <div class="form-group">
                  <label for="oversBowled" class="text-muted mb-1"><small>Overs bowled(don't enter balls)</small></label>
                  <input required id="oversBowled" value="0" class="form-control" type="number" placeholder="Enter total over bowled" autocomplete="off" />
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-6">
                <div class="form-group">
                  <label for="wicketsTaken" class="text-muted mb-1"><small>Taken wickets</small></label>
                  <input required  id="wicketsTaken" value="0" class="form-control" type="number" placeholder="Enter total wickets" autocomplete="off" />
                </div>
              </div>
              <div class="col-6">
                <div class="form-group">
                  <label for="madenOvers" class="text-muted mb-1"><small>Maden Overs</small></label>
                  <input required id="madenOvers" value="0" class="form-control" type="number" placeholder="Enter maden overs" autocomplete="off" />
                </div>
              </div>
            </div>
              <div class="row">
                <div class="col-6">
                  <div class="form-group">
                    <label for="wideBalls" class="text-muted mb-1"><small>Wide Balls</small></label>
                    <input required  id="wideBalls" value="0" class="form-control" type="number" placeholder="Enter total wide-balls" autocomplete="off" />
                  </div>
                </div>
                <div class="col-6">
                  <div class="form-group">
                    <label for="noBalls" class="text-muted mb-1"><small>No Blls</small></label>
                    <input required id="noBalls" value="0" class="form-control" type="number" placeholder="Enter total no-balls" autocomplete="off" />
                  </div>
                </div>
              </div>
          </div>
`
doesPlayerBatted.addEventListener("change", () => {
    let selected=doesPlayerBatted.value
    if (!document.querySelector("#batting-data-form")) {
      if(selected=="yes"){
        battingFormField.insertAdjacentHTML("beforeend", battingFormHtml)
        battingData={
          runs:0,
          balls:0,
          fours:0,
          sixes:0,
          outType:null
        }
      }
    }
    if(selected=="no"){
      if (document.querySelector("#batting-data-form")) {
        document.querySelector("#batting-data-form").remove()
      }
      battingData=null
    }
})

doesPlayerBowled.addEventListener("change", () => {
  let selected=doesPlayerBowled.value
  if (!document.querySelector("#bowling-data-form")) {
    if(selected=="yes"){
      bowlingFormField.insertAdjacentHTML("beforeend", bowlingFormHtml)
      bowlingData={
        runs:0,
        overs:0,
        wideBalls:0,
        noBalls:0,
        wickets:0,
        madenOvers:0
      }
    }
  }
  if(selected=="no"){
    if (document.querySelector("#bowling-data-form")) {
      document.querySelector("#bowling-data-form").remove()
    }
    bowlingData=null
  }
})

let battingDataField=document.getElementById("battingData")
let bowlingDataField=document.getElementById("bowlingData")
function dataCleanUp(){
  if(battingData!=null){
    battingData={
      runs:document.querySelector("#scoredRuns").value,
      balls:document.querySelector("#fatchedBalls").value,
      fours:document.querySelector("#fours").value,
      sixes:document.querySelector("#sixes").value,
      outType:document.querySelector("#outType").value
    }
  }

  if(bowlingData!=null){
    bowlingData={
        runs:document.querySelector("#givenRuns").value,
        overs:document.querySelector("#oversBowled").value,
        wideBalls:document.querySelector("#wideBalls").value,
        noBalls:document.querySelector("#noBalls").value,
        wickets:document.querySelector("#wicketsTaken").value,
        madenOvers:document.querySelector("#madenOvers").value
      }
  }
  battingDataField.value=JSON.stringify(battingData)
  bowlingDataField.value=JSON.stringify(bowlingData)
}


// document.getElementById("practiceMatchDataSubmitButton").addEventListener("click", function(e) {
//   e.preventDefault()
//   dataCleanUp()
//   if (confirm(`Are you sure about your entered match data?`)) {
//     console.log(battingDataField.value)
//     console.log(bowlingDataField.value)
//     document.getElementById("practiceMatchDetailsForm").submit()
//   }
  
// })

document.getElementById("practiceMatchDetailsForm").addEventListener("submit", function(e) {
  e.preventDefault()
  dataCleanUp()
  if (confirm(`Are you sure about your entered match data?`)) {
    console.log(battingDataField.value)
    console.log(bowlingDataField.value)
    document.getElementById("practiceMatchDetailsForm").submit()
  }
  
})
