[deployment]
run = ["tsx", "server/index.ts"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80

[start_server]
name = "Start application"
run = ["tsx", "server/index.ts"]