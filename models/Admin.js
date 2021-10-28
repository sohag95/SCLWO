
const administrationCollection = require("../db").db().collection("administration")
const fs = require("fs")

let Admin = function (data) {
  this.data = data
  this.errors = []
}
Admin.prototype.cleanUp = function () {
 
    if (typeof this.data.regNumber != "string") {
      this.data.regNumber = ""
    }
    if (typeof this.data.password != "string") {
      this.data.password = ""
    }
    this.data = {
      regNumber: this.data.regNumber.trim().toLowerCase(),
      password: this.data.password
    }
}

Admin.prototype.adminLogin = function () {
  return new Promise((resolve, reject) => {
    try {
      this.cleanUp()
      administrationCollection
        .findOne({ regNumber: this.data.regNumber })
        .then(attemptedUser => {
          if (attemptedUser && (this.data.password===attemptedUser.password)) {
            console.log("Executed!!")
            this.data = attemptedUser
            resolve("Congrats!")
          } else {
            reject("Invalid registration number / password.")
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



Admin.uploadingSlidePicture = function (filePath, file, name) {
  return new Promise(async (resolve, reject) => {
    try {
      if (name == "slideNo1" || name == "slideNo2" || name == "slideNo3" || name == "slideNo4" || name == "slideNo5") {
        if (fs.existsSync(filePath)) {
          //file exists
          try {
            fs.unlinkSync(filePath)
            //file removed
            file.mv(filePath, function (error) {
              if (error) {
                reject(error)
              } else {
                resolve("Slide picture successfully updated.")
              }
            })
          } catch (err) {
            reject("there is some problem!!")
          }
        } else {
          file.mv(filePath, function (error) {
            if (error) {
              reject(error)
            } else {
              resolve("Slide picture successfully uploaded.")
            }
          })
        }
      } else {
        reject("You have choosen wrong slide name.")
      }
    } catch (err) {
      reject("Sorry there is some problem!! Try again later..")
    }
  })
}

module.exports = Admin