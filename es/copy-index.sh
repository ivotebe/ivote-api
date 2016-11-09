#!/bin/bash
HOST="469c3fcba4d983641ddd30557d30b356.us-east-1.aws.found.io"
FROM_ENV=$1
TO_ENV=$2

USER="hive"
PASSWD="1nktv1sjeS"

TS=$(date +"%T")

CURL="curl --silent -u${USER}:${PASSWD}"

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    JQ_BIN="./jq-linux64"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    JQ_BIN="./jq-osx-amd64"
else
    echo "Running on something different then OSX or Linux is not supported. Exiting."
    exit 1
fi

echo "Getting the current index version"
CURRENT_IDX=$($CURL -XGET "http://$HOST:9200/_alias/bigboards-hive-$TO_ENV" | ${JQ_BIN} 'keys[0]' | sed -e 's/^"//'  -e 's/"$//')
CURRENT_SEQ=$(echo $CURRENT_IDX | cut -d '-' -f4)
NEXT_SEQ=$(expr $CURRENT_SEQ + 1)
NEXT_IDX="bigboards-hive-${TO_ENV}-${NEXT_SEQ}"
echo "Found the current index for ${TO_ENV} to be ${CURRENT_IDX} so the next index would be ${NEXT_IDX}"

echo "Creating the new index ${NEXT_IDX}"
$CURL -XPUT "http://$HOST:9200/${NEXT_IDX}" -d @library-index.json

echo  "Copying the data from the ${FROM_ENV} to ${TO_ENV}:${NEXT_SEQ}"
elasticdump --input="http://${USER}:${PASSWD}@${HOST}:9200/bigboards-hive-${FROM_ENV}" --output="http://${USER}:${PASSWD}@${HOST}:9200/${NEXT_IDX}"

echo "Switch the alias"
$CURL -XPOST "http://$HOST:9200/_aliases" -d "
{
    \"actions\": [
        { \"remove\": {
            \"alias\": \"bigboards-hive-${TO_ENV}\",
            \"index\": \"${CURRENT_IDX}\"
        }},
        { \"add\": {
            \"alias\": \"bigboards-hive-${TO_ENV}\",
            \"index\": \"${NEXT_IDX}\"
        }}
    ]
}
"