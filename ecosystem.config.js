module.exports = {
  apps : [{
    name   : "scripter",
    cwd : "src",
    script : "daphne -p 8002 -v 0 scripter.asgi:application",
    watch: ["main", "scripter"],
    ignore_watch: ["logs", ".git", "notes.txt"]
  }]
}
