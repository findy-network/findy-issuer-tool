#!/bin/bash

getReadyStatus(){
    # TODO: use https
    local resCode=$(curl -s --write-out '%{http_code}' --output /dev/null https://$SUB_DOMAIN_NAME.$DOMAIN_NAME/user)
    if (( ${resCode} == 401 )); then
        return 0
    else
        return 1
    fi
}


NOW=${SECONDS}
printf "Wait until backend is ready"
while ! getReadyStatus; do
    printf "."
    waitTime=$(($SECONDS - $NOW))
    if (( ${waitTime} >= 600 )); then
        printf "\nBackend failed to start.\n"
        exit 1
    fi
    sleep 1
done
