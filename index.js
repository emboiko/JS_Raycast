const express = require("express")
const path = require("path")

const app = express()
app.use(express.static("public"))
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")))

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
