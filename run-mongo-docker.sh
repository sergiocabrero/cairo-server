# docker pull mongo
docker run --name cairo-mongo -d -p 27017:27017 -v `pwd`/db/:/data/db/ mongo 