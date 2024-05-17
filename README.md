# ADA - Air Domain Awareness
Receives input from dump1090 and publishes new information to a redis server. Purges stale aircraft after a specified duration.

## Requirements
1. dump1090 operating with --net specified
2. A redis server running somewhere (I use a the redis/redis-stack Docker image)

## How it works
Any SBS-1 formatted messages being sent to port 30003 will be processed. For my setup, I have a nooelec nesdr smart usb sdr with a half-wave dipole antenna being read by dump1090. A docker container runs the redis/redis-stack Docker image. Each time a message is received, the redis db is queried for that aircraft's data it already has. If any data exists, any new data is added to that entry or those fields are updated. Each data point is timestamped, and every one minute each entry in the db is checked for stale-ness.
