D='/home/ubuntu/cairo-server/'
sh $D/run-mongo-docker.sh
sleep 5
nodejs $D/lightserver.js 